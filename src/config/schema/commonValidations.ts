const Joi = require("joi");

export const sourceapp = Joi.string()
  .valid("centralPortal", "branchPortal")
  .required();

export const password = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
  .invalid("&lt;", "&gt;", "''", '\\"') // 🚫 disallow sanitized leftovers
  .required()
  .messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 100 characters",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "any.required": "Password is required",
    "any.invalid": "Password contains invalid characters",
  });

export const stringValue = (name: string) => {
  return Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": `${name} must be a string `,
      "string.empty": `${name} is required`,
      "string.min": `${name} must be at least 3 characters long`,
      "string.max": `${name} cannot exceed 50 characters`,
      "any.required": `${name} is required`,
    });
};

export const NumberValue = (name: string) => {
  return Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": `${name} must be a positive number`,
      "any.required": `${name} is required`,
    });
};

export const phonenumber = Joi.string()
  .pattern(/^\+251[79]\d{8}$/) // Matches +251 followed by 7 or 9, then 8 digits
  .optional()
  .messages({
    "string.pattern.base":
      'Phone number must start with "+251" followed by either 7 or 9, and then 8 digits.',
    "string.empty": "Phone number is required.",
  });

export const BoolValue = (validValue: boolean) => {
  return Joi.boolean().valid(validValue).required();
};

export const StringValidValues = (...validValues: string[]) => {
  return Joi.string()
    .valid(...validValues)
    .required();
};
