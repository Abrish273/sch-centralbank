declare global {
  var _CONFIG: TopLevelConfig;
}

import dotenv from "dotenv";
import "express-async-errors";
import express, {
  type Request,
  type Response,
  type NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import timeout from "connect-timeout";
import mongoDB from "./config/mongoDB";
import { TopLevelConfig } from "./config/Types/config";
import initConfig from "./config/config";
import corsOptions from "./config/corsOptions";
import helmet from "helmet";
import sanitizeInputMiddleware from "./util/sanitize.utils";
// import { tempTokenMiddleware } from "./utils/dev/dev.utils";
import passport from "passport";
import session from "express-session";
import redisClient from "./config/redisConnection";
// import { initializePassport } from "./config/passport-config";
// import { seedSuperAdmin } from "./controllers/auth.controller";
import { errorHandler } from "./util/errorHandler.utils";
import router from "./routes";
import { seedSuperAdmin } from "./controller/auth.controller";
import { initializePassport } from "./config/passport-config";
import { authenticateToken } from "./middleware/authenticate";
const RedisStore = require("connect-redis").RedisStore;

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cors(corsOptions));
// if (process.env.NODE_ENV === "development") {
//   if (process.env.ENV === "back") {
//     app.use(tempTokenMiddleware);
//   } // for only backend development purpose
// }
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
});

// app.use(
//   session({
//     store: redisStore,
//     secret: "mySecret",
//     saveUninitialized: false,
//     resave: false,
//     name: "sessionId",
//     cookie: {
//       secure: process.env.NODE_ENV === "production", // Ensure it's set to true for HTTPS, false for non-HTTPS
//       httpOnly: true,
//       maxAge: 1000 * 6 * 3, // 3 minutes
//     },
//   })
// );

app.use(
  session({
    secret: process.env.REDIS_SESSION as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 3, httpOnly: true },
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());
// app.use(tempTokenMiddleware);
app.use(timeout("40s"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Content-Type, access-control-allow-origin, x-api-applicationid, authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "OPITIONS, GET, PUT, PATCH, POST, DELETE"
  );
  next();
});

app.use(sanitizeInputMiddleware);

app.use(
  authenticateToken.unless({
    path: [
      { url: "/v1.0/schpay/api/central/auth/healthcheck", methods: ["GET"] },
      {
        url: "/v1.0/schpay/api/central/auth/seed/superadmin",
        methods: ["GET"],
      },
      {
        url: "/v1.0/schpay/api/central/auth/bank/login",
        methods: ["POST"],
      },
      {
        url: "/v1.0/schpay/api/central/auth/setup/mfa",
        methods: ["POST"],
      },
      {
        url: "/v1.0/schpay/api/central/auth/setup/mfa",
        methods: ["POST"],
      },
      {
        url: "/v1.0/schpay/api/central/auth/verify/mfa",
        methods: ["POST"],
      },
      {
        url: "/v1.0/schpay/api/central/setting/change/password",
        methods: ["POST"],
      }
    ],
  })
);

router(app);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: "Resource not found",
  });
});

app.use(errorHandler);

process.on("uncaughtException", (error: Error) => {
  console.error(`Caught exception: ${error}\nException origin: ${error.stack}`);
  if (process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

const initApp = async () => {
  try {
    let _CONFIG: TopLevelConfig = await initConfig();
    global._CONFIG = _CONFIG;
    mongoDB.connect();
    // connectKafkaProducer();
    // seedSuperAdmin();
    // await populatePermissions();
    app.listen(_CONFIG.CENTRAL_SCH_PORT, function connectionListener() {
      console.log(
        `✅ Hi there! I'm listening on port ${_CONFIG.CENTRAL_SCH_PORT}`
      );
    });
  } catch (err) {
    console.error("Failed to load configuration and start the server:", err);
    process.exit(1);
  }
};

initApp();

export default app;