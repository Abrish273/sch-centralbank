import express from "express";
import authController from "../controller/auth.controller";
import { validateSchema } from "../middleware/validate";
import {
  centralloginSchema,
  verifyOtpSchema,
} from "../config/schema/authValidation";
import { authenticatePassport } from "../middleware/authenticatePassport";
import { isAuthenticated } from "../middleware/authenticateUser";

const router = express.Router();

router.get(
  "/healthcheck",
  // rateLimiter,
  authController.healthcheck
);

router.post(
  "/bank/login",
  validateSchema({ body: centralloginSchema }),
  authenticatePassport,
  authController.login
);

router.get(
  "/seed/superadmin",
  // rateLimiter,
  authController.seedSuAdmin
);

router.post(
  "/setup/mfa",
  validateSchema({ body: centralloginSchema }),
  isAuthenticated,
  authController.setupMfa
);

router.post(
  "/verify/mfa",
  validateSchema({ body: verifyOtpSchema }),
  isAuthenticated,
  authController.verifyMfa
);

router.post("/reset/mfa", isAuthenticated, authController.reset2FA);
router.post("/test", authController.sampleTestFunction);


export default router;
