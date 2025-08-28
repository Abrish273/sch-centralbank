// import { unless } from "express-unless";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// import initConfig from "../config/config";
// import { compareHash } from "../utils/auth.utils";
// import { appendData, getData } from "../dal/redis.dal";

// const authenticateToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.log("=== authenticate start ===", req.headers["authorization"]);

//   const authHeader = req.headers["authorization"];
//   const bearer = authHeader && authHeader.split(" ")[0];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!authHeader || bearer !== "Bearer" || !token) {
//     return res
//       .status(401)
//       .json({ message: "unauthenticated | Token required" });
//   }

//   console.log("-- token ---", token);

//   try {
//     const _CONFIG = await initConfig();
//     const decoded = jwt.verify(token, _CONFIG.secret) as JwtPayload;
//     console.log("#-# decoded #-#", decoded);
//     const { dtx, ...originalData } = decoded;

//     console.log("--- originalData ---", originalData);

//     const dt = {
//       id: originalData.id,
//       fullname: originalData.fullname,
//       schoolcode: originalData.schoolcode,
//       schoolname: originalData.schoolname,
//       usercode: originalData.usercode,
//       realm: originalData.realm,
//       role: originalData.role,
//       poolsource: originalData.poolsource,
//       phonenumber: originalData.phonenumber,
//       r001: originalData.r001,
//       r002: originalData.r002,
//       r003: originalData.r003,
//     };

//     if (!compareHash(dt, decoded.dtx)) {
//       return res.status(403).json({
//         message: "Unauthorized",
//         messageErr: "Forbidden: Data integrity check failed",
//       });
//     }

//     // Fetch session details from Redis
//     const fetchRedisData = await getData(decoded.redKey);
//     if (!fetchRedisData.success) {
//       return res.status(401).json({
//         message: "Unauthorized.",
//         messageErr: "Unauthorized.ZZZ",
//       });
//     }

//     console.log("=== fetchRedisData ===", fetchRedisData.data);
//     const now = Date.now();
//     let tokenExpiration = fetchRedisData.data.tokenExpiration
//       ? new Date(fetchRedisData.data.tokenExpiration).getTime()
//       : null;

//     if (!tokenExpiration) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized.",
//         messageErr: "Session expired or invalid token",
//       });
//     }

//     const timeLeft = tokenExpiration - now;
//     console.log("timeLeft", timeLeft);

//     // Check if session duration exceeds 15 minutes
//     const sessionStartTime = new Date(fetchRedisData.data.tokenExpiration);
//     sessionStartTime.setMinutes(
//       sessionStartTime.getMinutes() - fetchRedisData.data.extensionCount * 5
//     );
//     const sessionDuration = now - sessionStartTime.getTime();

//     if (sessionDuration >= 15 * 60 * 1000) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized.",
//         messageErr: "Session expired after 15 minutes",
//       });
//     }

//     // Extend token if expiring in 30 seconds and hasn't exceeded max extensions
//     if (timeLeft <= 30 * 1000 && fetchRedisData.data.extensionCount < 3) {
//       const newExpiration = new Date(now + 5 * 60 * 1000).toISOString();
//       const update = {
//         tokenExpiration: newExpiration,
//         extensionCount: fetchRedisData.data.extensionCount + 1,
//       };

//       await appendData(decoded.redKey, update);

//       console.log(`Token extended. New expiration time: ${newExpiration}`);

//       // Update the tokenExpiration variable to reflect the new value
//       tokenExpiration = new Date(newExpiration).getTime();
//     }

//     const resp = Object.fromEntries(
//       Object.entries({
//         id: decoded.id,
//         usercode: decoded.usercode,
//         schoolcode: decoded.schoolcode,
//         schoolname: decoded.schoolname,
//         fullname: decoded.fullname,
//         poolsource: decoded.poolsource,
//         phonenumber: decoded.phonenumber,
//         branchname: decoded.branchname ?? null,
//         branchcode: decoded.branchcode ?? null,
//         r001: decoded.r001,
//         r002: decoded.r002,
//         r003: decoded.r003,
//         tokenExpiration,
//       }).filter(([_, value]) => value !== null)
//     );

//     (req as any).user = resp;
//     next();
//   } catch (err) {
//     return res.status(403).json({
//       message: "Token expired or invalid",
//       error: err,
//     });
//   }
// };

// authenticateToken.unless = unless;

// export { authenticateToken };
