import express from "express";
import authController from "../controller/auth.controller";
import { validateSchema } from "../middleware/validate";
import { centralloginSchema } from "../config/schema/authValidation";
import { authenticatePassport } from "../middleware/authenticatePassport";

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
export default router;