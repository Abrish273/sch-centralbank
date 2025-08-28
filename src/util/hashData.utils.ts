import crypto from "crypto";
import { LogConsole } from "./log.utils";

export const hashData = (data: any): string => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return crypto.createHash("sha256").update(stringData).digest("hex");
};

export const compareHashData = (data: any, expectedHash: string): boolean => {
  const computedHash = hashData(data);
  LogConsole("=== computedHash ===", computedHash);
  LogConsole("=== expectedHash ===", expectedHash);

  return computedHash === expectedHash;
};

/*
  These functions are used for hashing and comparing data using SHA-256.
  - hashData: Takes any data (string or object), converts it to a string if necessary,
    and returns its SHA-256 hash in hexadecimal format.
  - compareHashData: Takes data and an expected hash, computes the hash of the data,
    and compares it to the expected hash, returning true if they match and false otherwise.
  - can be used for data integrity verification, in append only db, transaction registration, etc. 

*/