import { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins";

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    console.log(
      "origin",
      allowedOrigins.indexOf(origin!) !== -1 ||
      process.env.NODE_ENV !== "production"
    );
    if (
      allowedOrigins.indexOf(origin!) !== -1 || process.env.NODE_ENV !== "production"
        ? !origin // for production to block remove the exclamation mark
        : origin
    ) {
      callback(null, true);
    } else {
      callback(new Error("Sorry You are not allowed to access this resource!"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
