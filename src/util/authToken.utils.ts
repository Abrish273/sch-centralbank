import jwt, { Secret } from "jsonwebtoken";
import initConfig from "../config/config";
import { LogConsole } from "./log.utils";
import AppError from "./appError";

export const createToken = async (payload: object): Promise<string> => {
  const _CONFIG = await initConfig();
  const secret: Secret = _CONFIG.secret;

  let expiresIn: number | string;

  if (typeof _CONFIG.expiresIn === "number") {
    expiresIn = _CONFIG.expiresIn; // seconds
  } else if (typeof _CONFIG.expiresIn === "string") {
    // Only allow valid ms-style string formats
    if (/^\d+$/.test(_CONFIG.expiresIn)) {
      expiresIn = Number(_CONFIG.expiresIn); // convert numeric string to number
    } else {
      expiresIn = _CONFIG.expiresIn; // e.g., '1h', '7d'
    }
  } else {
    expiresIn = "15m"; // default fallback
  }

  const options: any = { expiresIn };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = async (token: string): Promise<any> => {
  const _CONFIG = await initConfig();
  const secret: Secret = _CONFIG.secret;

  try {
    return jwt.verify(token, secret);
  } catch (error: any) {
    LogConsole("JWT verification failed:", error.message);
    throw new AppError({ message: "UnAuthenticated" }, 401, {
      message: "Invalid or expired token",
    });
  }
};
