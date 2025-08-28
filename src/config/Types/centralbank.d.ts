import { Document } from "mongoose";

export interface loginInterface {
  loginPassword: string;
  lastFivePasswords: Array;
  isMfaActive: boolean;
  twoFactorSecret: string;
  loginAttemptCount: number;
  lastLoginAttempt: Date;
  isMaxLoginLimit: boolean;
  // Password lifecycle
  isDefaultPassword: boolean;
  passwordChangedAt: Date;
  // Account lockout
  isLoginDisabled: boolean;
  // Optional: Add audit metadata
  lastLoginAt: Date;
}

export interface ICentral extends Document {
  userCode: string;
  fullName: string;
  phoneNumber: string;
  realm: "central";
  role: object;
  poolSource: "centralPortal";
  login: loginInterface;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  actionBy: object;
}
