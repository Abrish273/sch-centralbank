import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import {
  formatPhoneNumber,
  generateTenDigitNumber,
} from "../util/randNum.utils";
import initConfig from "../config/config";
import { hashpassword } from "../util/hashpassword.utils";
import mongoose from "mongoose";
import { seedAdminService } from "../service/seedAuth.service";
import { LogConsole } from "../util/log.utils";
import { updateCentralBankUserDal } from "../dal/centralbank.dal";
import { getPermissionsService } from "../service/auth.service";

const healthcheck = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      status: "OK",
      message: "auth microservice is healthy and up!",
    });
  }
);

export const seedSuperAdmin = async (
  manualseed: boolean = false
): Promise<any> => {
  LogConsole("=== HERE IN THE SUPER ADMIN ===");
  const _CONFIG = await initConfig();
  console.log("password", _CONFIG.loginPassword);
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

const seedSuAdmin = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    LogConsole("=== HERE IN THE SUPER ADMIN ===");
    const { success } = await seedSuperAdmin(true);
    LogConsole("--- result ---", success);
    if (success) {
      return res.status(200).json({
        success: true,
        message: "user seeded successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "user already seeded" });
    }
  }
);

const login = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    console.log("the req.user is: ", (req as any).user);
    console.log("the session is: ", (req as any).session);
    if ((req as any).user.login.isMfaActive) {
      console.log("==== here in the check mfa ====", (req as any).user);
      return res.status(200).json({
        username: (req as any).user.fullName,
        isMfaActive: (req as any).user.login.isMfaActive,
      });
    } else {
      console.log("here in the check user first time...");
      return res.status(200).json({
        username: (req as any).user.fullName,
        isMfaActive: (req as any).user.login.isMfaActive,
      });
    }
  }
);

const setupMfa = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    console.log("the req.user is: ", (req as any).user);
    const user = (req as any).user;
    console.log("the user is in the set up mmmmm: ", user);
    try {
      console.log("the req.user is: ", req.user);
      const user: any = req.user;
      let secret = speakeasy.generateSecret();
      console.log("the secret object is: ", secret);
      const data = {
        "login.twoFactorSecret": secret.base32,
        "login.isMfaActive": true,
      };
      updateCentralBankUserDal(user._id, data);
      const url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: user.fullName,
        issuer: "www.wallet.com",
        encoding: "base32",
      });
      const qrImageUrl = await qrCode.toDataURL(url);
      return res.status(200).json({
        secret: secret.base32,
        next: "/v1.0/schpay/api/central/auth/verify/mfa",
        qrCode: qrImageUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "error setting up 2fa", message: error });
    }
  }
);

const verifyMfa = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    console.log("=== HERE IN THE VERIFY MFA ===");
    const { token } = req.body; // token means the otp
    const user: any = req.user;
    console.log("--- user =-==", user.login);
    // console.log("--two factor secret---", user.login.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret: user.login.twoFactorSecret, // twoFactorSecret
      encoding: "base32",
      token,
    });
    console.log("--- verified ---", verified);
    if (verified) {
      const response: any = await getPermissionsService(user);
      return res.status(200).json(response);
    } else {
      res.status(401).json({
        message: "Invalid 2FA token.",
      });
    }
  }
);

const reset2FA = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    try {
      const user = (req as any).user;
      const data = {
        "login.twoFactorSecret": "",
        "login.isMfaActive": false,
      };
      const updateUser = await updateCentralBankUserDal(user._id, data, true);
      if (updateUser !== null) {
        return res
          .status(200)
          .json({ message: "2FA reset successfully", success: true });
      } else {
        return res.status(500).json({
          message: "something went wrong try again later.",
          error: "Error in resetting 2FA",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong try again later.",
        error: `Error in resetting 2FA ${error}`,
      });
    }
  }
);
const logout = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // deleteData(id); // of the redis when the user logs out.
  }
);

const sampleTestFunction = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({
      success: true,
      message: "school ms is healthy and up.",
      data: (req as any).user,
    });
  }
);

export default {
  healthcheck,
  seedSuAdmin,
  login,
  setupMfa,
  verifyMfa,
  logout,
  reset2FA,
};
