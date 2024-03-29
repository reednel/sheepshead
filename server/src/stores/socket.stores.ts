import { redisClient } from "../setups/redis";

/**
 * Map a user to a user socket in Redis.
 * @param {number} userId
 * @param {string} socketId
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function mapToUserSocket(userId: number, socketId: string) {
  try {
    const userSocketKey = `userSocket:${userId}`;
    await redisClient.set(userSocketKey, socketId);
  } catch (error) {
    console.error("Error in mapToUserSocket:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Unmap a user from a user socket in Redis.
 * @param {number} userId
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function unmapToUserSocket(userId: number) {
  try {
    const userSocketKey = `userSocket:${userId}`;
    await redisClient.del(userSocketKey);
  } catch (error) {
    console.error("Error in unmapToUserSocket:", error);
    throw new Error("Internal Server Error");
  }
}
