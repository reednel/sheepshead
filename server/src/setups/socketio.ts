import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { mapToUserSocket, unmapToUserSocket } from "../stores/socket.stores";
import registerGameHandlers from "../handlers/game.handlers";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";

export function initializeWebSocket(server: HttpServer) {
  let io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  // Functions to fetch jwks
  var client = jwksClient({
    jwksUri: "http://localhost:4000/auth/jwt/jwks.json",
  });

  function getKey(header: JwtHeader, callback: SigningKeyCallback) {
    client.getSigningKey(header.kid, function (err, key) {
      var signingKey = key!.getPublicKey();
      callback(err, signingKey);
    });
  }

  io.use(function (socket: any, next: any) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        getKey,
        {},
        function (err, decoded) {
          if (err) return next(new Error("Authentication error"));
          socket.decoded = decoded;
          next();
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", function (socket: any) {
    // Connection now authenticated
    console.log("Authenticated user socket connected!"); // DEBUG
    const userId = socket.decoded.sub;

    // Store the mapping in Redis
    mapToUserSocket(userId, socket.id);

    registerGameHandlers(io!, socket);

    socket.on("disconnect", () => {
      unmapToUserSocket(userId);
    });
  });
}
