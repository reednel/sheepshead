import express from "express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import * as gameController from "../controllers/game.controllers";

const router = express.Router();

router.post("/create-house", verifySession(), gameController.createHouse);
router.post("/join-house/:house_id", verifySession(), gameController.joinHouse);
router.post(
  "/leave-house/:house_id",
  verifySession(),
  gameController.leaveHouse
);

export default router;
