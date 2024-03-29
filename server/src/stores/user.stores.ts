import { prisma } from "../setups/prisma";
import { users } from "@prisma/client";

// Check if an email is banned
export async function isBannedEmail(email: string) {
  let bannedEmails = await prisma.users_banned.findMany({
    where: { email: email },
  });
  return bannedEmails.length > 0;
}

/**
 * Get a user record by username.
 * @param {string} username - The username to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUsername(
  username: string
): Promise<users | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!user) {
      console.warn(`User not found for username: ${username}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for username ${username}:`, error);
    throw error;
  }
}

/**
 * Get a user record by user_id.
 * @param {string} user_id - The user_id to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByUserId(user_id: number): Promise<users | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: user_id },
    });

    if (!user) {
      console.warn(`User not found for user_id: ${user_id}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for user_id ${user_id}:`, error);
    throw error;
  }
}

/**
 * Get a user record by email.
 * @param {string} email - The email to search for.
 * @returns {Promise<users|null>} The user object if found, or null if not found.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function getUserByEmail(email: string): Promise<users | null> {
  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.warn(`User not found for email: ${email}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user for email ${email}:`, error);
    throw error;
  }
}

/**
 * Create users record and user_configs record with all default values
 * @param username
 * @param email
 * @returns {Promise<users|null>}
 */
export async function createUserRecord(
  username: string,
  email: string
): Promise<users | null> {
  try {
    let user = null;
    await prisma.$transaction(async (prisma: any) => {
      user = await prisma.users.create({
        data: { username: username, email: email },
      });
      await prisma.user_configs.create({
        data: { user_id: user.user_id },
      });
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update an existing user record.
 * @param {users} user - The user object to update.
 * @returns {Promise<users|null>} The new user object if successful, or null if not successful.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function updateUserRecord(
  userID: number,
  user: users
): Promise<users | null> {
  try {
    const updatedUser = await prisma.users.update({
      where: { user_id: userID },
      data: {
        display_name: user.display_name,
        display_city: user.display_city,
        display_region: user.display_region,
        display_country: user.display_country,
        bio: user.bio,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Update a user's email address.
 * @param {string} email - The new email address.
 * @param {number} userID - The user_id to update.
 * @returns {Promise<users|null>} The new user object if successful, or null if not successful.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function updateUserEmail(userID: number, email: string) {
  try {
    const updatedUser = await prisma.users.update({
      where: { user_id: userID },
      data: { email: email },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user email:", error);
    throw error;
  }
}

/**
 * Delete user record.
 * Cascades to user_configs, friends, and friend_requests
 * @param {users} userID - The user object to delete.
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function deleteUserRecord(userID: string): Promise<void> {
  try {
    await prisma.$transaction(async (prisma: any) => {
      await prisma.users.delete({ where: { user_id: userID } });
      await prisma.user_configs.delete({ where: { user_id: userID } });
      await prisma.friends.deleteMany({
        where: {
          OR: [{ user_1_id: userID }, { user_2_id: userID }],
        },
      });
      await prisma.friend_requests.deleteMany({
        where: {
          OR: [{ from_user_id: userID }, { to_user_id: userID }],
        },
      });
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
