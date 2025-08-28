import dotenv from "dotenv";
dotenv.config();

import vault from "node-vault";
import { TopLevelConfig } from "./Types/config";

const vaultClient = vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

async function loadConfig() {
  try {
    const result = await vaultClient.read(process.env.VAULT_PATH as string);

    return result.data.data;
  } catch (error) {
    console.error("Error reading from Vault:", error);
    throw error;
  }
}

const getConfig = (config: TopLevelConfig): TopLevelConfig => ({
  MONGODB_SCHPAY_URL: config.MONGODB_SCHPAY_URL,
  CENTRAL_SCH_PORT: config.CENTRAL_SCH_PORT,
  secret: config.secret,
  loginPassword: config.loginPassword,
  phoneNumber: config.phoneNumber,
  realm: config.realm,
  portalCard: config.portalCard,
  role: config.role,
  poolSource: config.poolSource,
  firstPasswordSet: config.firstPasswordSet,
  fullName: config.fullName,
  salt: config.salt,
  ENCRYPTION_KEY: config.ENCRYPTION_KEY,
  expiresIn: config.expiresIn,
  TEMP_TOKEN_SECRET: config.TEMP_TOKEN_SECRET,
  roleId: config.roleId,
});
async function initConfig(): Promise<TopLevelConfig> {
  const config = await loadConfig();
  const initConf = await getConfig(config);
  return initConf;
}

export default initConfig;
