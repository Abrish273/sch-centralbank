import Redis from "ioredis";

let redisClient: Redis | null = null;

const connectRedis = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: "localhost", // Use "redis-secure" if inside a Docker network
      port: 6379, // Ensure this matches the exposed port
      password: "your_secure_password", // Redis password set in Docker
      db: 0, // Select Redis database (0 is default)
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    redisClient.on("error", (err: any) => {
      console.error("❌ Redis error: ", err);
    });
  }

  return redisClient;
};

export default connectRedis;
