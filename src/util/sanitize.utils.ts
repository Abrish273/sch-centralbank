import express, { Request, Response, NextFunction } from "express";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Initialize DOMPurify with JSDOM
const window = new JSDOM("").window;
const purify = DOMPurify(window);

function sanitizeForSQL(input: string): string {
  // Implement SQL sanitization (as shown previously)
  if (typeof input !== "string") return input;

  return input
    .replace(/'/g, "''")
    .replace(/"/g, '\\"')
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "");
}

function sanitizeForNoSQL(input: string): string {
  if (typeof input !== "string") return input; // Return as-is if not a string

  return input
    .replace(/\$/g, "")
    .replace(/\./g, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "''")
    .replace(/"/g, '\\"')
    .replace(/\\/g, "\\\\");
}

function sanitizeInputMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const sanitizeObject = (obj: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          // Sanitize strings for HTML, SQL, and NoSQL injections
          obj[key] = purify.sanitize(obj[key]); // HTML sanitization
          obj[key] = sanitizeForSQL(obj[key]); // SQL sanitization
          obj[key] = sanitizeForNoSQL(obj[key]); // NoSQL sanitization
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          // Recursively sanitize objects
          sanitizeObject(obj[key]);
        } else {
          console.warn(
            `Unexpected data type for key "${key}": ${typeof obj[key]}`
          );
          return next(new Error("Invalid input data.")); // Pass the error to the error handling middleware
        }
      }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
  } catch (error) {
    console.error("Error sanitizing input:", error);
    return next(new Error("Invalid input data.")); // Pass the error to the error handling middleware
  }
  next();
}

export default sanitizeInputMiddleware;
