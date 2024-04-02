import { Server, Socket } from "socket.io";
import { initHand } from "../middlewares/gamemodes";
import {
  createHand,
  getDeck,
  getHand,
  getHouse,
  updateHand,
} from "../stores/game.stores";

import { MoveData } from "../types/socket.types";
import { HandPhases, HandRoles } from "../types/redis.types";

const registerGameHandlers = (io: Server, socket: any) => {
  // socket: Socket
  const joinHouse = (houseKey: string) => {
    socket.join(houseKey);
  };

  const playerMove = (moveData: MoveData) => {
    const { houseKey, move } = moveData;
    socket.to(houseKey).emit("updateGame", move);
  };

  const startHand = async (houseID: string) => {
    const house_id = Number(houseID);
    const user_id = Number(socket.decoded.sub);

    const house = await getHouse(house_id);

    if (house.host_id !== user_id) {
      socket.emit("error", {
        success: false,
        message: "Not authorized to start hand",
      });
      return;
    }

    const deck = await getDeck();
    const handData = await initHand(house, deck, 0);
    await createHand(handData);

    // send each player their hand
    for (const player of handData.players) {
      const playerHand = player.hand || [];
      io.to(`userSocket:${player.user_id}`).emit("handStart", playerHand);
    }
  };

  /**
   * Pick or pass
   * @param handID
   * @param pick
   */
  const pickOrPass = async (handID: string, pick: boolean) => {
    const hand_id = Number(handID);
    const user_id = Number(socket.decoded.sub);

    let hand = await getHand(hand_id);
    let player = hand.players[hand.next_player];
    const house = await getHouse(hand.house_id);
    const playerCount = house.player_count;
    const leasterLegal = house.leaster_legal;

    // Verify it's the correct phase
    if (hand.phase !== HandPhases.POP) {
      socket.emit("error", {
        success: false,
        message: "Invalid phase",
      });
      return;
    }

    // verify it's the user's turn
    if (player.user_id !== user_id) {
      socket.emit("error", {
        success: false,
        message: "Not your turn",
      });
      return;
    }

    // Pick or pass
    if (pick) {
      player.passed = false;
      player.role = HandRoles.PICKER;
      player.hand = player.hand!.concat(hand.blind!); // problematic given how we're handling 5+1 or 5+2?
      hand.blind = [];
      hand.players[hand.next_player] = player;
      hand.phase = HandPhases.BURY;
      // it remains this player's turn
    } else {
      player.passed = true;
      hand.players[hand.next_player] = player;
      hand.next_player = hand.next_player + 1;

      if (hand.next_player >= playerCount) {
        if (leasterLegal) {
          hand.leaster = true;
          hand.phase = HandPhases.PLAY;
          hand.next_player = 0;
        } else {
          hand.next_player = 0;
          // somehow reset the games
        }
      }
    }

    // Store the updates
    await updateHand(hand);

    // Send the update to all players // TODO: only send necessary bits
    io.to(`house:${hand.house_id}`).emit("handUpdate", hand);
  };

  socket.on("playerMove", playerMove);
  socket.on("joinHouse", joinHouse);
  socket.on("startHand", startHand);
  socket.on("pickOrPass", pickOrPass);
};

export default registerGameHandlers;
