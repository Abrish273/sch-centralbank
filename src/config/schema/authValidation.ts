import Joi from "joi";
import { BoolValue, password, phonenumber, sourceapp, StringValidValues, stringValue } from "./commonValidations";

export const centralbankSchema = Joi.object({
  userCode: stringValue("user code"),
  fullName: stringValue("full name"),
  contactDetails: Joi.object({
    phoneNumber: phonenumber,
  }).required(),
  realm: StringValidValues("central"),
  portalCard: Joi.array().items(stringValue("portal card")).required(),
  role: StringValidValues(
    "superAdmin",
    "security",
    "manager",
    "productManager"
  ),
  poolSource: StringValidValues("centralPortal", "branchPortal"),
  login: Joi.object({
    isMfaActive: BoolValue(false),
    twoFactorSecret: Joi.string().valid("").required(),
    loginPassword: stringValue("two factor secret"),
    lastFivePasswords: stringValue("last five login passwoerds"),
    lastLoginAttempt: stringValue("last login attempts"),
    isDefaultPassword: Joi.boolean().required(),
  }).required(),
});

export const centralloginSchema = Joi.object({
  sourceapp: sourceapp,
  phonenumber: phonenumber,
  password: password,
});