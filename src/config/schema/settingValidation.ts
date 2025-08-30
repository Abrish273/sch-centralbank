import Joi from "joi";
import { password, phonenumber, sourceapp } from "./commonValidations";

export const chegePasswordSchema = Joi.object({
  sourceapp: sourceapp,
  phonenumber: phonenumber,
  password: password,
  confirmedpassword: password,
  otpverified: Joi.string().valid("true").required(),
});
