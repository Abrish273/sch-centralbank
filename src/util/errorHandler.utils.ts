import { Request, Response, NextFunction } from "express";
import AppError from "./appError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const response: {
    success: boolean;
    message: string;
    response?: any;
    stack?: string;
    devError?: any;
  } = {
    success: false,
    message: err.response?.message || err.message || "Something went wrong",
  };

  // Attach all other keys from err.response except "message"
  if (err.response && Object.keys(err.response).length > 1) {
    const { message, ...rest } = err.response;
    if (Object.keys(rest).length > 0) {
      response.response = rest;
    }
  }

  // Show extra info in non-production
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    if (err.devError) {
      response.devError = err.devError;
    }
  }

  res.status(statusCode).json(response);
};

export { errorHandler };
