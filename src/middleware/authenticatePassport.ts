import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { LogConsole } from "../util/log.utils";

export const authenticatePassport = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    "local",
    (err: any, user: any, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Authentication failed",
        });
      }
      LogConsole("&&&&&&&&&&&");

      // ✅ Ensure the user is logged in and stored in the session
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }

        LogConsole("✅ Authenticated user session:", req.session);
        next();
      });
    }
  )(req, res, next);
};