import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "localhost", // Change to Redis container name if using Docker
    port: 6379,
  },
  // password: "your_secure_password", // Remove if no password is set
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error: ", err);
});

redisClient.connect().catch(console.error);

export default redisClient;
