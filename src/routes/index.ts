import { type Express } from "express";
import authRoutes from "./auth.routes";

export default function initRoutes(app: Express): void {
  app.use("/v1.0/schpay/api/central/auth", authRoutes);
  //   app.use("/v1.0/schpay/api/bank/branch", bankbranchRoutes);
  //   app.use("/v1.0/schpay/api/bank/central", bankCentralRoutes);
}
