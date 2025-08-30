import express from "express";
import settingController from "../controller/setting.controller";
import { validateSchema } from "../middleware/validate";
import { chegePasswordSchema } from "../config/schema/settingValidation";

const router = express.Router();

router.post(
  "/change/password",
  // rateLimiter,
  validateSchema({ body: chegePasswordSchema }),
  settingController.changePassword
);

export default router;
