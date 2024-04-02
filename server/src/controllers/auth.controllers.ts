import { Response } from "express";
import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import { deleteUser as deleteAuthUser } from "supertokens-node";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import { SessionRequest } from "supertokens-node/framework/express";
import { isValidEmail } from "../middlewares/typeValidation";
import {
  getUserByEmail,
  isBannedEmail,
  updateUserEmail,
  deleteUserRecord,
} from "../stores/user.stores";

/**
 * Delete user record
 * Cascades to user_configs, friends, and friend_requests
 * Also deletes the user from the auth database
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function deleteUser(req: SessionRequest, res: Response) {
  const userID = req.body.userID;
  try {
    await deleteUserRecord(userID);
    await deleteAuthUser(userID);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(`Error deleting user:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Change user email
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function changeEmail(req: SessionRequest, res: Response) {
  let session = req.session!;
  let email = req.body.email;
  let userID = Number(session.getUserId());

  // Validate the input email
  if (!isValidEmail(email)) {
    return res.status(400).send("Email is invalid");
  }

  // Check if email is banned
  if (await isBannedEmail(email)) {
    return res.status(400).send("Email is banned");
  }

  // Check that the email is verified for this user ID
  let isVerified = await EmailVerification.isEmailVerified(
    session.getRecipeUserId(),
    email
  );

  if (!isVerified) {
    // Check if email is already in use
    if (await getUserByEmail(email)) {
      return res
        .status(400)
        .send("Email already in use. Please sign in, or use another email");
    }

    // Send the email verification link to the user for the new email
    await EmailVerification.sendEmailVerificationEmail(
      session.getTenantId(),
      session.getUserId(),
      session.getRecipeUserId(),
      email
    );

    return res.status(200).send("Email verification email sent");
  }

  try {
    await updateUserEmail(userID, email);
    await EmailPassword.updateEmailOrPassword({
      recipeUserId: session.getRecipeUserId(),
      email: email,
    });
    return res.status(200).send("Email updated");
  } catch (error) {
    console.error("Error updating email:", error);
    return res.status(500).send("Internal server error");
  }
}

/**
 * Change user password
 * @param {SessionRequest} req
 * @param {Response} res
 * @returns {Promise<void>}
 * @throws {Error} Throws an error for database issues, invalid input, etc.
 */
export async function changePassword(req: SessionRequest, res: Response) {
  let session = req.session;
  let oldPassword = req.body.oldPassword;
  let updatedPassword = req.body.newPassword;
  let userId = req.session!.getUserId();
  let userInfo = await SuperTokens.getUser(session!.getUserId());

  if (userInfo === undefined) {
    throw new Error("Should never come here");
  }

  let loginMethod = userInfo.loginMethods.find(
    (lM) =>
      lM.recipeUserId.getAsString() ===
        session!.getRecipeUserId().getAsString() &&
      lM.recipeId === "emailpassword"
  );
  if (loginMethod === undefined) {
    throw new Error("Should never come here");
  }
  const email = loginMethod.email!;

  // call signin to check that input password is correct
  let isPasswordValid = await EmailPassword.signIn(
    session!.getTenantId(),
    email,
    oldPassword
  );

  if (isPasswordValid.status !== "OK") {
    // TODO: handle incorrect password error
    return;
  }

  // update the user's password
  let response = await EmailPassword.updateEmailOrPassword({
    recipeUserId: session!.getRecipeUserId(),
    password: updatedPassword,
    tenantIdForPasswordPolicy: session!.getTenantId(),
  });

  if (response.status === "PASSWORD_POLICY_VIOLATED_ERROR") {
    // TODO: handle incorrect password error
    return;
  }

  // revoke all sessions for the user
  await Session.revokeAllSessionsForUser(userId);

  // revoke user's session, removing the auth cookies, logging out the user on frontend
  await req.session!.revokeSession();

  // TODO: send successful password update response
}
