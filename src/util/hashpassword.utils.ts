import initConfig from "../config/config";
import crypto from "crypto";
import { LogConsole } from "./log.utils";


export const hashpassword = async (pin: string) => {
  const _CONFIG = await initConfig();
  const salt = _CONFIG.salt;
  LogConsole("--- Salt during hashing ---", salt);
  const hash: string = crypto
    .pbkdf2Sync(pin, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  LogConsole("--- Generated hash ---", hash);
  return hash;
};

export const compareHashPassword = async (
  inputPin: string,
  storedHash: string
): Promise<boolean> => {
  const _CONFIG = await initConfig();
  const hashedInputPin = await hashpassword(inputPin);
  LogConsole("--- Hashed input PIN ---", hashedInputPin);
  LogConsole("--- storedHash ---", storedHash);
  return hashedInputPin === storedHash;
};
