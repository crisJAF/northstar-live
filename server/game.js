import { randomBytes, randomUUID, randomInt } from "node:crypto";
import { scenes, shortSceneIds } from "../shared/story.js";
import { jobs } from "../shared/jobs.js";
import { newPuzzle, puzzles, puzzleView, solve } from "./puzzles.js";
export function current(room) {
  return scenes.find((s) => s.id === room.route[room.step]);
}
export function createRoom(mode = "full") {
  return {
    code: randomBytes(3).toString("hex").toUpperCase(),
    hostKey: randomUUID(),
    players: [],
    mode: mode === "short" ? "short" : "full",
    route: mode === "short" ? shortSceneIds : scenes.map((s) => s.id),
    step: 0,
    closed: false,
    votes: {},
    proposals: {},
    approved: [],
    energy: 0,
    chargePhase: "first",
    releaseTicks: 0,
    ready: [],
    history: [],
    seals: [],
    puzzle: newPuzzle(),
    startedAt: Date.now(),
    extraSeconds: 0,
  };
}
export function join(room, name, token) {
  let player = room.players.find((p) => p.token === token);
  if (player) return player;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 24)
    throw Error("Usá un apodo de 1 a 24 caracteres.");
  if (
    room.players.some(
      (p) => p.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
    )
  )
    throw Error(
      "Ese apodo ya está en la sala. Elegí otro; recargar la página no recupera una identidad anterior.",
    );
  if (room.players.length >= 20) throw Error("La sala está llena.");
  const used = new Set(room.players.map((p) => p.jobIndex));
  const available = jobs.map((_, i) => i).filter((i) => !used.has(i));
  const pool = available.length ? available : jobs.map((_, i) => i);
  const pair = Math.floor(room.players.length / 2);
  // Alternate individual players between teams: seven per team with 14 players.
  player = {
    id: randomUUID(),
    token: randomUUID(),
    name: name.trim(),
    team: room.players.length % 2,
    pair,
    jobIndex: pool[randomInt(pool.length)],
    online: false,
    holding: false,
  };
  room.players.push(player);
  return player;
}
export function options(room) {
  const scene = current(room);
  return scene.type === "ballot"
    ? room.approved.map((id) => ({ id, label: room.proposals[id] }))
    : (scene.options || []).map((label, id) => ({ id: String(id), label }));
}
export function vote(room, id, value) {
  if (
    room.closed ||
    !["vote", "ballot"].includes(current(room).type) ||
    !options(room).some((o) => o.id === value)
  )
    throw Error("Ese voto no está disponible.");
  room.votes[id] = value;
}
export function result(room) {
  const counts = options(room).map((o) => ({
    ...o,
    count: Object.values(room.votes).filter((v) => v === o.id).length,
  }));
  const max = Math.max(0, ...counts.map((o) => o.count));
  return { counts, winners: counts.filter((o) => o.count === max && max > 0) };
}
export function award(room, seal) {
  if (seal && !room.seals.some((s) => s.name === seal.name))
    room.seals.push(seal);
}
export function submit(room, player, value) {
  const scene = current(room);
  if (scene.type !== "puzzle" || room.closed)
    throw Error("No hay un puzzle abierto.");
  if (scene.id === "circuits" && player.team !== room.puzzle.stage % 2)
    throw Error(
      "Tu equipo tiene el manual. Dictá las instrucciones a los operadores.",
    );
  solve(scene.id, room.puzzle, value);
  if (room.puzzle.solved) award(room, puzzles[scene.id].seal);
}
export function assist(room) {
  const scene = current(room);
  if (scene.type === "puzzle") {
    room.puzzle.solved = true;
    room.puzzle.assisted = true;
    room.puzzle.feedback = "Resuelto con ayuda del presentador. ¡Seguimos!";
    award(room, puzzles[scene.id].seal);
  }
  if (scene.type === "charge") {
    room.energy = 100;
    room.chargePhase = "done";
    award(room, { name: "Vuelo", digit: "7" });
  }
}
export function advance(room, skip = false) {
  const scene = current(room);
  if (room.step >= room.route.length - 1) return;
  if (scene.type === "proposal" && !room.approved.length) {
    if (!skip) throw Error("Aprobá al menos una propuesta.");
    room.proposals.fallback = "Derecho a llegar de goma el 26";
    room.approved = ["fallback"];
  }
  if (scene.type === "puzzle" && !room.puzzle.solved) {
    if (!skip) throw Error("Resuelvan el puzzle o usá Saltar con ayuda.");
    assist(room);
  }
  if (scene.type === "charge" && room.energy < 100) {
    if (!skip) throw Error("Completen la carga o usá Saltar con ayuda.");
    assist(room);
  }
  room.history.push({
    id: scene.id,
    ...result(room),
    assisted: room.puzzle.assisted,
    attempts: room.puzzle.attempts,
  });
  room.step++;
  room.closed = false;
  room.votes = {};
  room.puzzle = newPuzzle();
  room.startedAt = Date.now();
  room.extraSeconds = 0;
  room.players.forEach((p) => (p.holding = false));
}
export function tickCharge(room, now = Date.now()) {
  if (current(room).type !== "charge" || room.energy >= 100) return;
  for (const p of room.players)
    if (now - (p.lastHold || 0) > 1500) p.holding = false;
  const active = room.players.filter((p) => p.online);
  const counts = [0, 1].map(
    (t) => active.filter((p) => p.team === t && p.holding).length,
  );
  if (room.chargePhase === "release") {
    room.releaseTicks = active.every((p) => !p.holding)
      ? room.releaseTicks + 1
      : 0;
    if (room.releaseTicks >= 4) room.chargePhase = "second";
    return;
  }
  const targets = [0, 1].map((t) =>
    Math.min(5, Math.max(1, active.filter((p) => p.team === t).length)),
  );
  if (counts.every((n, i) => n >= targets[i])) {
    room.energy = Math.min(100, room.energy + 2.5);
    if (room.chargePhase === "first" && room.energy >= 50) {
      room.energy = 50;
      room.chargePhase = "release";
    }
    if (room.energy >= 100) {
      room.chargePhase = "done";
      award(room, { name: "Vuelo", digit: "7" });
    }
  }
}
export function snapshot(room, host = false, playerId) {
  const scene = current(room),
    player = room.players.find((p) => p.id === playerId);
  return {
    code: room.code,
    mode: room.mode,
    scene: scene.id,
    step: room.step,
    route: room.route,
    closed: room.closed,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      pair: p.pair,
      online: p.online,
      job: jobs[p.jobIndex],
    })),
    responded: Object.keys(room.votes).length,
    myVote: player ? room.votes[player.id] : undefined,
    myProposal: player ? room.proposals[player.id] : undefined,
    options: options(room),
    results: room.closed ? result(room) : null,
    proposals: host ? room.proposals : undefined,
    approved: host ? room.approved : undefined,
    energy: room.energy,
    chargePhase: room.chargePhase,
    ready: room.ready,
    history: room.history,
    seals: room.seals,
    puzzle:
      scene.type === "puzzle"
        ? puzzleView(scene.id, room.puzzle, player, room.players, host)
        : null,
    startedAt: room.startedAt,
    durationSeconds: (scene.minutes || 0) * 60 + room.extraSeconds,
    holding: [0, 1].map(
      (t) =>
        room.players.filter((p) => p.team === t && p.holding && p.online)
          .length,
    ),
  };
}
