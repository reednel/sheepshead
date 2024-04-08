import { Server, Socket } from "socket.io";
import {
  initHand,
  getNextPhase,
  setCallableCards,
} from "../middlewares/gamemodes";
import {
  createHand,
  getDeck,
  getHand,
  getHouse,
  updateHand,
} from "../stores/game.stores";

import { MoveData } from "../types/socket.types";
import { HandPhases, PlayerRoles, CardData } from "../types/redis.types";

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
    const handData = await initHand(house, deck);
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
    const nopick_mode = house.nopick_mode;

    // Verify it's the correct phase
    if (hand.phase !== HandPhases.POP) {
      socket.emit("error", {
        success: false,
        message: "Invalid phase",
      });
      return;
    }

    // Verify it's the player's turn
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
      player.role = PlayerRoles.PICKER;
      player.hand = player.hand!.concat(hand.blind!); // problematic given how we're handling 5+1 or 5+2?
      hand.blind = [];
      hand.players[hand.next_player] = player;
      hand.phase = HandPhases.BURY;
      // it remains this player's turn
    } else {
      player.passed = true;
      hand.players[hand.next_player] = player;
      hand.next_player = hand.next_player + 1;

      // TODO: make a switch for all the nopick modes
      if (hand.next_player >= playerCount) {
        if (nopick_mode) {
          hand.nopick = true;
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

  /**
   * Bury cards
   * @param handID
   * @param cards
   */
  const bury = async (handID: string, cards: CardData[]) => {
    const hand_id = Number(handID);
    const user_id = Number(socket.decoded.sub);

    let hand = await getHand(hand_id);
    let player = hand.players[hand.next_player];
    const house = await getHouse(hand.house_id);

    // Verify it's the correct phase
    if (hand.phase !== HandPhases.BURY) {
      socket.emit("error", {
        success: false,
        message: "Invalid phase",
      });
      return;
    }

    // Verify it's the player's turn
    if (player.user_id !== user_id) {
      socket.emit("error", {
        success: false,
        message: "Not your turn",
      });
      return;
    }

    // Verify the cards are in the player's hand
    for (const card of cards) {
      if (!player.hand!.includes(card)) {
        socket.emit("error", {
          success: false,
          message: "Invalid card",
        });
        return;
      }
    }

    // Verify the correct number of cards are being buried
    if (cards.length !== 2) {
      // TODO: extract to a switch, not all gamemodes have 2
      socket.emit("error", {
        success: false,
        message: "Invalid number of cards",
      });
      return;
    }

    // Bury the cards
    player.hand = player.hand!.filter((card) => !cards.includes(card));
    hand.buried = hand.buried!.concat(cards);

    // Look to the next phase
    const nextPhase = getNextPhase(house.gamemode, hand.phase);
    if (nextPhase === HandPhases.CALL) {
      player.hand = setCallableCards(player.hand, hand.buried);
      hand.phase = HandPhases.CALL;
      // it remains this player's turn
    } else if (nextPhase === HandPhases.PLAY) {
      // TODO: set playable cards for first player
      // TODO: bundle the relevant info for each player?
      hand.phase = HandPhases.PLAY;
      hand.next_player = 0;
    }

    hand.players[hand.next_player] = player;

    // Store the updates
    await updateHand(hand);

    // Send the update to all players // TODO: only send necessary bits
    io.to(`house:${hand.house_id}`).emit("handUpdate", hand);
  };

  socket.on("playerMove", playerMove);
  socket.on("joinHouse", joinHouse);
  socket.on("startHand", startHand);
  socket.on("pickOrPass", pickOrPass);
  socket.on("bury", bury);
};

export default registerGameHandlers;
