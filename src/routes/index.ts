import { type Express } from "express";
import authRoutes from "./auth.routes";
import settingRoutes from "./setting.routes";


export default function initRoutes(app: Express): void {
  app.use("/v1.0/schpay/api/central/auth", authRoutes);
  app.use("/v1.0/schpay/api/central/setting", settingRoutes);
  //   app.use("/v1.0/schpay/api/bank/central", bankCentralRoutes);
}
