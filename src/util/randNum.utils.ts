import { v4 as uuidv4 } from "uuid";

export const generateUUIDRandomNumber = () => {
  const number: string = uuidv4();
  return number;
};

export const generateRandomIdwithPrefix = (prefix: string): string => {
  if (prefix.length < 3) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (prefix.length < 3) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      prefix += randomChar;
    }
  }

  if (prefix.length > 3) {
    prefix = prefix.slice(0, 3);
  }

  prefix = prefix.toUpperCase();

  const [seconds, nanoseconds] = process.hrtime();
  const microseconds = Math.floor(nanoseconds / 100);
  const formattedSeconds = String(seconds).slice(-7);
  const formattedMicroseconds = String(microseconds).padStart(7, "0");
  const randomPart = String(Math.floor(Math.random() * 1000000)).padStart(
    6,
    "0"
  );

  return `${prefix.toUpperCase()}${formattedSeconds}${formattedMicroseconds}${randomPart}`;
};

export const generateRandomNumbers = () => {
  // Generate a random number between 0 and 999999
  const randomId = Math.floor(100000 + Math.random() * 900000);
  return randomId.toString();
};

export const generateTenDigitNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

export const formatPhoneNumber = (phoneNumber: string) => {
  if (String(phoneNumber).startsWith("0"))
    return "+251" + String(phoneNumber).substring(1);
  else if (
    String(phoneNumber).startsWith("9") ||
    String(phoneNumber).startsWith("7")
  )
    return "+251" + String(phoneNumber);
  else if (String(phoneNumber).startsWith("+")) return String(phoneNumber);
  else if (String(phoneNumber).startsWith("251"))
    return "+" + String(phoneNumber);
};
