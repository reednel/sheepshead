import { Response } from "express";
import { SessionRequest } from "supertokens-node/framework/express";
import { updateUserRecord } from "../stores/user.stores";

/**
 * Update an existing user record.
 * @param {SessionRequest} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<users|null>} The new user object if successful, or null if not successful.
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function updateUser(req: SessionRequest, res: Response) {
  const user = req.body.user;
  if (!user) {
    res.status(400).json({ message: "Invalid user object" });
    return;
  }
  if (!user.user_id) {
    res.status(400).json({ message: "Invalid user_id" });
    return;
  }
  const userID = Number(user.user_id);
  try {
    await updateUserRecord(userID, user);
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
