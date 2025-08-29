import passport from "passport";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = (
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
      console.log("--- user details ---", user);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Authentication failed",
        });
      }
      console.log("&&&&&&&&&&&");

      // ✅ Ensure the user is logged in and stored in the session
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }

        console.log("✅ Authenticated user session:", req.session);
        console.log("---- req.session ----", req.session);
        next();
      });
    }
  )(req, res, next);
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("=== req ===", req.isAuthenticated());
  console.log("---- erun ----", req.session);
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({
      next: "/v1.0/schpay/api/central/auth/bank/login",
      message: "Unauthorized..",
    });
  }
};
