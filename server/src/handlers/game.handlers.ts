import { Server, Socket } from "socket.io";
import { initHand } from "../middlewares/gamemodes";
import { createHand, getDeck, getHouse } from "../stores/game.stores";

import { MoveData } from "../types/socket.types";

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

  const pickOrPass = async (houseID: string, pick: boolean) => {
    const house_id = Number(houseID);
    const user_id = Number(socket.decoded.sub);

    //

    const house = await getHouse(house_id);
    // Uhh, stuff
  };

  socket.on("playerMove", playerMove);
  socket.on("joinHouse", joinHouse);
  socket.on("startHand", startHand);
  socket.on("pickOrPass", pickOrPass);
};

export default registerGameHandlers;
