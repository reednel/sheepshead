import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { HouseData } from "../types/redis.types";
import { randInt } from "../middlewares/utils";
import {
  addUserToHouse,
  createHouseRecord,
  removeUserFromHouse,
} from "../stores/game.stores";

/**
 * Create a new house record in the database and store it in Redis, add the caller as host of the house.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function createHouse(req: SessionRequest, res: Response) {
  try {
    const house: HouseData = req.body;

    // TODO: validate inputs

    if (house.host_id !== Number(req.session!.getUserId())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create this house.",
      });
    }

    await createHouseRecord(house);

    // Set expiration for the Redis key?
    // await redisClient.expire(houseKey, 3600);

    res.status(201).json({ house: house });
  } catch (error) {
    console.error("Error in createHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Join a house in the cache.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function joinHouse(req: SessionRequest, res: Response) {
  try {
    const house_id = Number(req.params.house_id);
    const user_id = Number(req.session!.getUserId());
    await addUserToHouse(house_id, user_id, randInt());
    res.json({ success: true, message: "Joined house" });
    // const socket = getUserSocket(user_id);
    // socket.emit('joinRoom', houseKey); // houseKey is like `house:123`
  } catch (error) {
    console.error("Error in joinHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Leave a house in the cache.
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function leaveHouse(req: SessionRequest, res: Response) {
  try {
    const house_id = Number(req.params.house_id);
    const user_id = Number(req.session!.getUserId());
    await removeUserFromHouse(house_id, user_id);
    res.json({ success: true, message: "Left house" });
  } catch (error) {
    console.error("Error in leaveHouse:", error);
    res.status(500).send("Internal Server Error");
  }
}
