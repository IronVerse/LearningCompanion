import OpenAI from "openai";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas, Image } from "canvas";
import { createWorker } from "tesseract.js";
global.Image = Image;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class ReportParserAgent {
  static instance;
  
  constructor() {
    if (ReportParserAgent.instance) return ReportParserAgent.instance;
    this.model = "gpt-4o"; // Use gpt-4o which supports vision
    ReportParserAgent.instance = this;
  }

  async parseReport({ path, type, filename }) {
    try {

      const buffer = await fs.readFile(path);
      // For image files, we can use the vision capabilities directly
      if (this.isImageType(type)) {
        console.log(buffer)
        console.log(typeof buffer)
        return await this.parseImageReport(buffer, filename);
      }
      
      // For PDF files, we need to convert to text first or use a different approach
      if (type.startsWith('pdf')) {
        return await this.parsePDFReport(buffer, filename);
      }
      
      throw new Error(`Unsupported file type: ${type}`);
      
    } catch (error) {
      console.error('Error parsing report:', error);
      throw error;
    }
  }

  async parseImageReport(buffer, filename) {
    // Convert buffer to base64 for vision API
    const base64Image = buffer.toString('base64');
    
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing South African school report cards. 
                   Extract student performance data including:
                   - Academic performance by subject (subject name, score/percentage)
                   - Overall performance indicators
                   
                   Return the data as structured JSON with appropriate keys.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all student performance data from this South African report card. 
                     Return strictly as JSON with the following structure:
                     {
                       "subjects": [
                         {
                           "subject": "string",
                           "score": "number",
                           "percentage": "number",
                           "level": "string",
                         }
                       ],
                     }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1 // Low temperature for more deterministic output
    });

    const jsonString = response.choices[0].message.content;
    
    // Clean and parse the JSON response
    const cleanedJson = jsonString.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  }

  async parsePDFReport(buffer, filename) {
    // For PDFs, we have a few options:
    // 1. Convert PDF to images and use vision (more complex)
    // 2. Extract text from PDF and use text-based parsing
    
    // Simple approach: Extract text and use text completion
    // Note: You might want to use a PDF text extraction library like pdf-parse
    
    const pdfText = await this.extractTextFromPDF(buffer);
    
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing South African school report cards from text.`
        },
        {
          role: "user",
          content: `Extract student performance data from this South African report card text:

${pdfText}

Return strictly as JSON with the following structure:
{
  "subjects": [
    {
      "subject": "string",
      "score": "number",
      "percentage": "number",
      "level": "string",
    }
  ],
}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const jsonString = response.choices[0].message.content;
    const cleanedJson = jsonString.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  }

  isImageType(type) {
    return type.startsWith('image');
  }

  async extractImagesFromPDF(buffer) {
  // Load the PDF document
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    const images = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better OCR
      const canvas = createCanvas(viewport.width, viewport.height);      
      const context = canvas.getContext("2d");
      console.log("canvas type:", typeof canvas, "constructor:", canvas.constructor.name);
      console.log("context type:", typeof context, "constructor:", context?.constructor?.name);
      console.log("context instanceof CanvasRenderingContext2D:", context.constructor.name === "CanvasRenderingContext2D");
      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      console.log('Rendered to page')

      // Get the image buffer (PNG)
      const imgBuffer = canvas.toBuffer("image/png");
      images.push(imgBuffer);
    }

    return images;
  }

  async extractTextFromPDF(buffer) {
    console.log("extractTextFromPDF called");
    const data = await pdfParse(buffer);
    if (data.text.trim().length > 20) {
      // Text-based PDF
      return data.text;
    } else {
      console.log("OCR TRIGGERED");
      // Likely image-based PDF: extract images and run OCR
      // (You'd need to implement image extraction here)
      const images = await this.extractImagesFromPDF(buffer); // You need to implement this
      let ocrText = "";
      const worker = await createWorker("eng");
      for (const img of images) {
        const { data: { text } } = await worker.recognize(img);
        ocrText += text + "\n";
      }
      await worker.terminate();
      return ocrText;
    }
  }

  // Helper method to handle file uploads if needed for other purposes
  async uploadFile(buffer, filename) {
    const file = await client.files.create({
      file: buffer, // or use buffer if supported
      purpose: "assistants"
    });
    return file;
  }
}


export default new ReportParserAgent();
