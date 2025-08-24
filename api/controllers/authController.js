// api/controllers/authController.js
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import ReportParserAgent from '../agents/ReportParserAgent.js';
import ReportAnalysisAgent from '../agents/ReportAnalysisAgent.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID missing from environment');
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// helpers
function setSessionCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS in prod
    sameSite: 'lax', // CSRF protection with cross-site navigations allowed
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function getSessionFromReq(req) {
  const token = req.cookies?.session;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export const register = async (req, res) => {

  const { originalname, mimetype, path, buffer } = req.file;
      let type;
      if (mimetype === "application/pdf") type = "pdf";
      else if (mimetype.startsWith("image/")) type = "image";
      else return res.status(400).json({ error: "Unsupported file type" });
  
      const result = await ReportParserAgent.parseReport({ path, type, filename: originalname });
      const improvementAreas = await ReportAnalysisAgent.analyze(result); 
}

// POST /api/auth/google
export const login = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // sub, email, email_verified, name, picture, hd?, etc.

    if (!payload?.email_verified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    // TODO: find-or-create user in your DB here if needed.
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      hd: payload.hd ?? null, // workspace domain if present
    };

    setSessionCookie(res, { uid: user.id, email: user.email });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid ID token' });
  }
};

// POST /api/logout
export const logout = (req, res) => {
  res.clearCookie('session');
  return res.sendStatus(204);
};

// GET /api/me
export const me = (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: 'Not signed in' });
  return res.json(session); // { uid, email, iat, exp }
};

// Optional middleware for protected routes
export const requireAuth = (req, res, next) => {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: 'Not signed in' });
  req.user = session;
  next();
};
