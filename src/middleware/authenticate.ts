import { unless } from "express-unless";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import initConfig from "../config/config";
import { verifyToken } from "../util/authToken.utils";
import { decryptData } from "../util/encryptData.util";
import { compareHashData } from "../util/hashData.utils";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("=== authenticate start ===", req.headers["authorization"]);

  const authHeader = req.headers["authorization"];
  const bearer = authHeader && authHeader.split(" ")[0];
  const token = authHeader && authHeader.split(" ")[1];

  if (!authHeader || bearer !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "unauthenticated", messageErr: "Token required" });
  }

  console.log("-- token ---", token);

  try {
    const _CONFIG = await initConfig();
    const decoded = (await verifyToken(token)) as JwtPayload;
    console.log("#-# decoded #-#", decoded);

    // 1 -decrypt ,
    //  2 - hash ,
    //  3 - compare
    const decrypted = await decryptData(String(decoded.enc));
    console.log("=== decrypted ===", decrypted);
    const compHash = compareHashData(decrypted, decoded.dtx);
    console.log("=== compHash ===", compHash);
    if (!compHash) {
      return res.status(403).json({
        message: "unauthenticated",
        messageErr: "Invalid token",
      });
    } else {
      const resp = Object.fromEntries(
        Object.entries({
          id: decrypted.id,
          usercode: decrypted.usercode,
          fullname: decrypted.fullname,
          phonenumber: decrypted.phonenumber,
          accountlevel: decrypted.accountlevel ?? null,
          schoolname: decrypted.schoolname ?? null,
          schoolcode: decrypted.schoolcode ?? null,
          branchname: decrypted.branchname ?? null,
          branchcode: decrypted.branchcode ?? null,
          r001: decrypted.r001, // realm
          r002: decrypted.r002, // role
          r003: decrypted.r003, // permissions
        }).filter(([_, value]) => value !== null)
      );

      console.log("=== resp ===", resp);

      (req as any).user = resp;
      next();
    }
  } catch (err) {
    return res.status(403).json({
      message: "Token expired or invalid",
      error: err,
    });
  }
};

authenticateToken.unless = unless;

export { authenticateToken };
