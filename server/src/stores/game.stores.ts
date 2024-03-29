import { prisma } from "../setups/prisma";
import { cards } from "@prisma/client";
import { redisClient } from "../setups/redis";
import { HouseData, HandData } from "../types/redis.types";

/**
 * Create a new house record in the database and store it in Redis.
 * @param {HouseData} house
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function createHouseRecord(house: HouseData) {
  try {
    // TODO: make this an upsert(?) that's called when a hand is submitted to app-db
    // Create house record in app-db
    const houseRecord = await prisma.houses.create({
      data: {
        host_id: house.host_id,
        gamemode: house.gamemode,
        player_count: house.player_count,
        leaster_legal: house.leaster_legal,
        double: house.double,
        chat_enabled: house.chat_enabled,
        players_permitted: house.players_permitted,
        spectators_permitted: house.spectators_permitted,
      },
    });
    // Create house record in app-cache
    const houseKey = `house:${houseRecord.house_id}`;
    house.house_id = houseRecord.house_id;
    await redisClient.set(houseKey, JSON.stringify(house));
  } catch (error) {
    console.error("Error in createHouseRecord:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Get a house record from redis.
 * @param {number} house_id
 * @returns {Promise<HouseData>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getHouse(house_id: number): Promise<HouseData> {
  try {
    const houseKey = `house:${house_id}`;
    const houseData = await redisClient.get(houseKey);

    if (!houseData) {
      throw new Error("House not found");
    }

    return JSON.parse(houseData as string);
  } catch (error) {
    console.error("Error in getHouseRecord:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Add a user to a house in Redis, at the specified position.
 * @param {number} house_id
 * @param {number} user_id
 * @param {number} seat
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function addUserToHouse(
  house_id: number,
  user_id: number,
  seat: number
) {
  try {
    const houseKey = `house:${house_id}`;
    const house = await getHouse(house_id);

    // Check if the house is full
    if (house.player_count <= house.player_ids.length) {
      throw new Error("House is full");
    }

    // Check if user is already in the house
    if (house.player_ids.includes(user_id)) {
      throw new Error("User already in house");
    }

    // Check if the user is allowed to join the house
    // TODO: implement this check

    // Add user to the house in the cache, in a random seat
    const seatIndex = seat % (house.player_ids.length + 1);
    house.player_ids.splice(seatIndex, 0, user_id);

    await redisClient.set(houseKey, JSON.stringify(house));
  } catch (error) {
    console.error("Error in addUserToHouse:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Remove a user from a house in Redis.
 * @param {number} house_id
 * @param {number} user_id
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function removeUserFromHouse(house_id: number, user_id: number) {
  try {
    const houseKey = `house:${house_id}`;
    const house = await getHouse(house_id);

    // Check if the user is in the house
    if (!house.player_ids.includes(user_id)) {
      throw new Error("User not in house");
    }

    house.player_ids = house.player_ids.filter((id: number) => id !== user_id);
    await redisClient.set(houseKey, JSON.stringify(house));
  } catch (error) {
    console.error("Error in removeUserFromHouse:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Get the current deck of cards.
 * Fetch it from app-db if it doesn't exist in the cache.
 * @returns {Promise<cards[]>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getDeck(): Promise<cards[]> {
  try {
    const deckData = await redisClient.get("deck");

    if (deckData) {
      return JSON.parse(deckData);
    }

    const deck = await prisma.cards.findMany();
    await redisClient.set("deck", JSON.stringify(deck));

    return deck;
  } catch (error) {
    console.error("Error in getDeck:", error);
    throw new Error("Internal Server Error");
  }
}

/**
 * Create a new hand record in the database and store it in Redis.
 * @param {HandData} hand
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function createHand(hand: HandData) {
  try {
    // Create hand record in app-cache
    const temp_hand_id = redisClient.incr("temp_hand_id");
    const handKey = `hand:${temp_hand_id}`;
    await redisClient.set(handKey, JSON.stringify(hand));
  } catch (error) {
    console.error("Error in createHandRecord:", error);
    throw new Error("Internal Server Error");
  }
}
