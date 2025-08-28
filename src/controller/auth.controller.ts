import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import {
  formatPhoneNumber,
  generateTenDigitNumber,
} from "../util/randNum.utils";
import initConfig from "../config/config";
import { hashpassword } from "../util/hashpassword.utils";
import mongoose from "mongoose";
import { seedAdminService } from "../service/seedAuth.service";
import { LogConsole } from "../util/log.utils";

const healthcheck = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      status: "OK",
      message: "auth microservice is healthy and up!",
    });
  }
);

export const seedSuperAdmin = async (manualseed: boolean = false): Promise<any> => {
  LogConsole("=== HERE IN THE SUPER ADMIN ===");
  const _CONFIG = await initConfig();
  console.log("password", _CONFIG.loginPassword)
  const hash = await hashpassword(_CONFIG.loginPassword);

  const adminDetails = {
    userCode: generateTenDigitNumber(), // CBU stands for central bank users
    fullName: _CONFIG.fullName,
    phoneNumber: formatPhoneNumber(_CONFIG.phoneNumber),
    role: new mongoose.Types.ObjectId(_CONFIG.roleId),
    login: {
      isMfaActive: false,
      twoFactorSecret: "",
      loginPassword: hash,
      lastFivePasswords: hash,
      isDefaultPassword: true,
    },
  };
  LogConsole("admin details", adminDetails);

  const { success, resp } = await seedAdminService(adminDetails);
  LogConsole("resp ===>>", resp);
  if (success) {
    LogConsole({
      success: true,
      message: "user seeded successfully",
      resp,
    });
    if (manualseed) return { success: true, resp };
  } else {
    LogConsole("already seeded.");
    if (manualseed) return { success: false };
  }
};

const seedSuAdmin = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  LogConsole("=== HERE IN THE SUPER ADMIN ===");
  const { success } = await seedSuperAdmin(true);
  LogConsole("--- result ---", success);
  if(success) {
    return res.status(200).json({
      success: true,
      message: "user seeded successfully",
    });
  } else {
    return res.status(400).json({ success: false, message: "user already seeded" });
  }
});

const login = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      status: "OK",
      message: "login endpoint",
    });
  }
);

export default { healthcheck, seedSuAdmin, login };
