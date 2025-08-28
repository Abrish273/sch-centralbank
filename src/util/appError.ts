class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public response: Record<string, any>;
  public devError?: any;

  constructor(
    response: Record<string, any>, // can contain multiple fields
    statusCode: number,
    devError?: any
  ) {
    super(response?.message || "Application Error");

    this.statusCode = statusCode;
    this.isOperational = true;

    // store full object (could have message, code, details, etc.)
    this.response = response;

    // only include devError in non-production
    if (process.env.NODE_ENV !== "production" && devError) {
      this.devError = devError;
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;

/*
// ✅ In production (NODE_ENV=production)
throw new AppError({ message: "User not found" }, 404);

// ✅ In dev/staging (NODE_ENV !== production)
throw new AppError(
  { message: "Validation failed" },
  400,
  { field: "email", reason: "Invalid format" }
);
*/