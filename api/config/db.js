import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open a database connection
export async function openDb() {
  return open({
    filename: './learningcompanion.db',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();
  await db.exec(`

CREATE TABLE IF NOT EXISTS Users (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Surname TEXT NOT NULL,
  Email TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Grade INTEGER NOT NULL,
  InitialQuizDone BOOLEAN,
);

CREATE TABLE IF NOT EXISTS Subjects (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Percent INTEGER,
  NeedsFocus BOOLEAN,
  UserID INTEGER,
  FOREIGN KEY (UserID) REFERENCES Users(ID)
);


CREATE TABLE IF NOT EXISTS Topics (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  SubjectID INTEGER,
  FOREIGN KEY (SubjectID) REFERENCES Subjects(ID)
);
  `);
  await db.close();
}

// Run this script once to initialize the DB
