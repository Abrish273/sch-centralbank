import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { LogConsole } from "../util/log.utils";
import AppError from "../util/appError";

interface ValidationSchemas {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

/**
 * Reusable middleware to validate req.body, req.query, req.params using Joi
 * @param schemas Joi schemas for body, query, params
 */
export const validateSchema = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      LogConsole("Validating request with schemas:", req.body);
      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, {
          abortEarly: false,
          allowUnknown: true,
        });
        if (error) {
          LogConsole("Validation body error:", error.details[0].message);
          throw new AppError(
            { success: false, message: "Invalid request." },
            400,
            { errors: error.details[0].message }
          );
        }
      }

      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, {
          abortEarly: false,
          allowUnknown: true,
        });
        if (error) {
          LogConsole("Validation query error:", error.details[0].message);
          throw new AppError(
            { success: false, message: "Invalid request." },
            400,
            { errors: error.details[0].message }
          );
        }
      }

      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, {
          abortEarly: false,
          allowUnknown: true,
        });
        if (error) {
          LogConsole("Validation params error:", error.details[0].message);
          throw new AppError(
            { success: false, message: "Invalid request." },
            400,
            { errors: error.details[0].message }
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
  