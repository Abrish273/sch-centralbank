import mongoose from "mongoose";
import initConfig from "./config";

const connect = async () => {
  const _CONFIG = await initConfig();
  try {
    mongoose
      .connect(_CONFIG.MONGODB_SCHPAY_URL)
      .then(() => {
        console.log("✅ connected to DB");
      })
      .catch((err) => {
        console.log(err, "ERROR");
      });
  } catch (error) {
    console.error(error, "Error");
  }
};

const disconnect = () => {
  if (!mongoose.connection) {
    return;
  }

  void mongoose.disconnect();
};

export default {
  connect,
  disconnect,
};
