import crypto from "crypto";
import initConfig from "../config/config";
import { LogConsole } from "./log.utils";
import AppError from "./appError";

/**
 * Encrypts data using AES-256-CBC.
 * @param data Any serializable object
 * @returns IV:EncryptedHex string
 */
export const encryptData = async (data: any): Promise<string> => {
  const _CONFIG = await initConfig();
  const encryptionKey = Buffer.from(_CONFIG.ENCRYPTION_KEY as string, "hex");

  if (encryptionKey.length !== 32) {
    throw new AppError(
      { message: "something went wrong try again later." },
      400,
      {
        errorMessage:
          "Invalid encryption key length. Must be 32 bytes for AES-256.",
      }
    );
  }

  try {
    const iv = crypto.randomBytes(16); // 16-byte IV
    const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error: any) {
    LogConsole("Encryption error:", error.message);
    throw new AppError(
      { message: "something went wrong try again later." },
      400,
      { error: error, errorMessage: "Failed to encrypt data" }
    );
  }
};

/**
 * Decrypts AES-256-CBC encrypted data.
 * @param encryptedData IV:EncryptedHex string
 * @returns Decrypted object
 */
export const decryptData = async (encryptedData: string): Promise<any> => {
  const _CONFIG = await initConfig();
  const encryptionKey = Buffer.from(_CONFIG.ENCRYPTION_KEY as string, "hex");

  if (encryptionKey.length !== 32) {
    throw new AppError(
      { message: "somethign went wrong try again later." },
      400,
      {
        errorMessage:
          "Invalid encryption key length. Must be 32 bytes for AES-256.",
      }
    );
  }

  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    if (!ivHex || !encrypted) {
      throw new AppError(
        { message: "somethign went wrong try again later." },
        400,
        { errorMessage: "Invalid encrypted data format." }
      );
    }

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const data = JSON.parse(decrypted);

    LogConsole("*** Decrypted data: ***", data);

    return data;
  } catch (error: any) {
    LogConsole("Decryption error:", error.message);
    throw new AppError(
      { message: "something went wrong try again later." },
      400,
      {
        error: error,
        errorMessage: "Failed to decrypt data",
      }
    );
  }
};
