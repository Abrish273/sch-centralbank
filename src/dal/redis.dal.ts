import connectRedis from "../config/redisConnection";
import { generateUUIDRandomNumber } from "../util/randNum.utils";

const redisClient = connectRedis();

const ttl = 240;
const ttx = 1200;

export const setData = async (data: any) => {
  if (!data) {
    return { success: false, error: "Key and data are required" };
  }

  const key = String(generateUUIDRandomNumber());
  console.log("=== key ===", key);

  let existingData = await redisClient.get(key);
  if (existingData) {
    return {
      success: false,
      message: `duplicated key name: ${key}`,
    };
  } else {
    try {
      // Store the data in Redis (serialized as JSON string)
      await redisClient.set(key, JSON.stringify(data), "EX", ttl);
      return {
        success: true,
        key: key,
        message: `Successfully created token with key: ${key}`,
      };
    } catch (error) {
      console.error("Failed to create data:", error);

      return {
        success: false,
        key: null,
        message: `Failed to create data: ${error}`,
      };
    }
  }
};

export const appendData = async (key: string, newData: any) => {
  if (!key || !newData) {
    return {
      success: false,
      error: "Key and new data are required",
      data: null,
    };
  }

  try {
    let existingData: string | null = await redisClient.get(key);
    console.log("=== existing data ===", existingData);

    if (!existingData) {
      return {
        success: false,
        message: `Key "${key}" not found in Redis`,
        data: null,
      };
    }
    // If data exists, parse it into an object
    if (existingData) {
      let parsedData: object = JSON.parse(existingData);
      // Append or merge the new data into the existing object
      existingData = { ...parsedData, ...newData };
    } else {
      // If no existing data, create a new object with the new data
      existingData = newData;
    }

    // Store the updated object back to Redis (serialized as JSON string)
    const data = await redisClient.set(
      key,
      JSON.stringify(existingData),
      "EX",
      ttl
    );
    return {
      success: true,
      message: `Successfully appended data to key: ${key}`,
      data: data,
    };
  } catch (error) {
    console.error("Failed to append data:", error);
    return { success: false, message: "Failed to append data", data: null };
  }
};

export const getData = async (key: string) => {
  if (!key) {
    return { success: false, message: "Key is required", data: null };
  }
  try {
    const data = await redisClient.get(key);
    console.log("--- data ---", data);

    if (data) {
      return {
        success: true,
        message: "successfully retrieved data",
        data: JSON.parse(data),
      };
    } else {
      return {
        success: false,
        message: "No data found for the given key",
        data: null,
      };
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { success: false, message: "Failed to fetch data", data: null };
  }
};

export const deleteData = async (key: false) => {
  if (!key) {
    return { success: false, message: "Key is required" };
  }
  try {
    const result = await redisClient.del(key);
    if (result) {
      return {
        success: true,
        message: `Successfully deleted data for key: ${key}`,
      };
    } else {
      return { success: false, message: "No data found for the given key" };
    }
  } catch (error) {
    console.error("Failed to delete data:", error);
    return { success: false, message: "Failed to delete data" };
  }
};

export const setPermissionData = async (key: string, data: any) => {
  if (!key || !data) {
    return { success: false, error: "Key and data are required" };
  }

  try {
    // Check if key already exists
    const existingData = await redisClient.get(key);
    if (existingData) {
      return {
        success: false,
        message: `Duplicated key name: ${key}`,
      };
    }

    // Store the data in Redis with TTL (as JSON string)
    await redisClient.setex(key, ttx, JSON.stringify(data));

    return {
      success: true,
      key,
      message: `Successfully created token with key: ${key}`,
    };
  } catch (error) {
    console.error("Failed to create data:", error);
    return {
      success: false,
      key: null,
      message: `Failed to create data: ${
        error instanceof Error ? error.message : error
      }`,
    };
  }
};