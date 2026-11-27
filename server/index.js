import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import {
  createRoom,
  join,
  vote,
  advance,
  snapshot,
  current,
  submit,
  assist,
  tick,
} from "./game.js";
export function createApp() {
  const app = express(),
    http = createServer(app),
    io = new Server(http, { maxHttpBufferSize: 10000 });
  const rooms = new Map();
  const broadcast = (r) => {
    for (const s of io.sockets.sockets.values())
      if (s.data.code === r.code)
        s.emit("state", snapshot(r, s.data.host, s.data.player));
  };
  io.on("connection", (socket) => {
    let calls = 0;
    const limiter = setInterval(() => (calls = 0), 1000);
    socket.on("action", (data, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        if (++calls > 25) throw Error("Esperá un momento.");
        if (!data || typeof data !== "object")
          throw Error("Solicitud inválida.");
        if (data.type === "create") {
          if (socket.data.code) throw Error("Ya estás en una sala.");
          if (rooms.size >= 50) throw Error("No hay salas disponibles.");
          const r = createRoom(data.mode);
          rooms.set(r.code, r);
          socket.data = { code: r.code, host: true };
          ack({ ok: true, code: r.code, hostKey: r.hostKey });
          broadcast(r);
          return;
        }
        const r = rooms.get(
          String(data.code || socket.data.code).toUpperCase(),
        );
        if (!r) throw Error("No encontramos esa sala.");
        if (socket.data.code && socket.data.code !== r.code)
          throw Error("Recargá para cambiar de sala.");
        if (data.type === "host") {
          if (data.key !== r.hostKey)
            throw Error("Clave del presentador incorrecta.");
          socket.data = { code: r.code, host: true };
        } else if (data.type === "watch") socket.data = { code: r.code };
        else if (data.type === "join") {
          const p = join(r, data.name, data.token);
          socket.data = { code: r.code, player: p.id };
          p.online = true;
          ack({ ok: true, token: p.token, id: p.id });
          broadcast(r);
          return;
        } else {
          if (socket.data.code !== r.code)
            throw Error("Entrá a la sala primero.");
          const p = r.players.find((p) => p.id === socket.data.player),
            scene = current(r);
          if (
            [
              "next",
              "skip",
              "close",
              "approve",
              "assist",
              "hint",
              "extend",
              "kick",
            ].includes(data.type)
          ) {
            if (!socket.data.host)
              throw Error("Solo el presentador puede hacer eso.");
            if (data.type === "next" || data.type === "skip")
              advance(r, data.type === "skip");
            if (data.type === "close") r.closed = true;
            if (data.type === "assist") assist(r);
            if (data.type === "hint" && scene.type === "puzzle")
              r.round.hint = Math.min(3, r.round.hint + 1);
            if (data.type === "extend") r.extraSeconds += 60;
            if (data.type === "kick") {
              const stale = r.players.find((p) => p.id === data.id);
              if (!stale || stale.online)
                throw Error("Solo se pueden retirar jugadores desconectados.");
              if (r.step !== 0)
                throw Error(
                  "El registro de puntos se conserva durante la partida. Usá saltar si falta alguien.",
                );
              r.players = r.players.filter((p) => p !== stale);
            }
            if (data.type === "approve") {
              if (scene.type !== "proposal" || !r.proposals[data.id])
                throw Error("Propuesta inválida.");
              if (r.approved.includes(data.id))
                r.approved = r.approved.filter((id) => id !== data.id);
              else {
                if (r.approved.length >= 4)
                  throw Error("Elegí hasta cuatro propuestas.");
                r.approved.push(data.id);
              }
            }
          } else {
            if (!p) throw Error("Entrá como jugador.");
            if (data.type === "vote") vote(r, p.id, String(data.value));
            else if (data.type === "solve") {
              const correct = submit(r, p, data.value, data.scene);
              ack({ ok: true, correct });
              broadcast(r);
              return;
            } else if (data.type === "proposal") {
              if (
                scene.type !== "proposal" ||
                r.closed ||
                typeof data.text !== "string" ||
                !data.text.trim() ||
                data.text.length > 60
              )
                throw Error(
                  "Escribí hasta 60 caracteres durante la negociación.",
                );
              r.proposals[p.id] = data.text.trim();
            } else if (data.type === "hold") {
              if (
                scene.type === "charge" &&
                !r.closed &&
                data.scene === scene.id
              ) {
                if (data.value === true && !p.holding)
                  p.holdStarted = Date.now();
                p.holding = data.value === true;
                p.lastHold = Date.now();
              }
            } else if (data.type === "ready") {
              if (scene.type === "ready" && !r.ready.includes(p.id))
                r.ready.push(p.id);
            } else throw Error("Acción desconocida.");
          }
        }
        ack({ ok: true });
        broadcast(r);
      } catch (e) {
        ack({ ok: false, error: e.message });
      }
    });
    socket.on("disconnect", () => {
      clearInterval(limiter);
      const r = rooms.get(socket.data.code);
      const p = r?.players.find((p) => p.id === socket.data.player);
      if (p) {
        p.online = [...io.sockets.sockets.values()].some(
          (s) => s.data.code === r.code && s.data.player === p.id,
        );
        p.holding = false;
        broadcast(r);
      }
    });
  });
  const ticker = setInterval(() => {
    for (const r of rooms.values()) {
      if (tick(r)) broadcast(r);
    }
  }, 250);
  app.get("/health", (_, res) => res.json({ ok: true }));
  app.use(express.static(fileURLToPath(new URL("../dist", import.meta.url))));
  app.get("/{*path}", (_, res) =>
    res.sendFile(fileURLToPath(new URL("../dist/index.html", import.meta.url))),
  );
  return {
    http,
    io,
    close: () => {
      clearInterval(ticker);
      io.close();
      http.close();
    },
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { http } = createApp();
  http.listen(Number(process.env.PORT) || 3001, "0.0.0.0", () =>
    console.log("Northstar Live: http://localhost:3001"),
  );
}
