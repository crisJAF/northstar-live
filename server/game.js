import { randomBytes, randomUUID, randomInt } from "node:crypto";
import { scenes, shortSceneIds } from "../shared/story.js";
import { jobs } from "../shared/jobs.js";
import { puzzles, puzzleView } from "./puzzles.js";
export const POINTS = 100,
  TRANSITION_MS = 5000,
  RETRY_MS = 4000;
export const current = (r) => scenes.find((s) => s.id === r.route[r.step]);
const competitive = (r) => ["puzzle", "charge"].includes(current(r).type);
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
    ready: [],
    history: [],
    seals: [],
    startedAt: Date.now(),
    extraSeconds: 0,
    roster: [],
    target: 0,
    round: {
      winners: [],
      attempts: {},
      cooldowns: {},
      charges: {},
      hint: 0,
      assisted: false,
    },
    advanceAt: null,
  };
}
export function join(r, name, token) {
  let p = r.players.find((p) => p.token === token);
  if (p) return p;
  if (r.step !== 0)
    throw Error(
      "La partida ya empezó. Solo pueden reconectarse los jugadores inscritos.",
    );
  if (typeof name !== "string" || !name.trim() || name.trim().length > 24)
    throw Error("Usá un apodo de 1 a 24 caracteres.");
  if (
    r.players.some(
      (p) => p.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
    )
  )
    throw Error("Ese apodo ya está ocupado.");
  if (r.players.length >= 20) throw Error("La sala está llena.");
  const used = new Set(r.players.map((p) => p.jobIndex)),
    available = jobs.map((_, i) => i).filter((i) => !used.has(i)),
    pool = available.length ? available : jobs.map((_, i) => i);
  p = {
    id: randomUUID(),
    token: randomUUID(),
    name: name.trim(),
    jobIndex: pool[randomInt(pool.length)],
    online: false,
    score: 0,
    solveTime: 0,
    joinOrder: r.players.length,
    holding: false,
  };
  r.players.push(p);
  return p;
}
export function options(r) {
  const s = current(r);
  return s.type === "ballot"
    ? r.approved.map((id) => ({ id, label: r.proposals[id] }))
    : (s.options || []).map((label, id) => ({ id: String(id), label }));
}
export function vote(r, id, value) {
  if (
    r.closed ||
    !["vote", "ballot"].includes(current(r).type) ||
    !options(r).some((o) => o.id === value)
  )
    throw Error("Ese voto no está disponible.");
  r.votes[id] = value;
}
export function result(r) {
  const counts = options(r).map((o) => ({
      ...o,
      count: Object.values(r.votes).filter((v) => v === o.id).length,
    })),
    max = Math.max(0, ...counts.map((o) => o.count));
  return { counts, winners: counts.filter((o) => o.count === max && max > 0) };
}
export function award(r, seal) {
  if (seal && !r.seals.some((s) => s.name === seal.name)) r.seals.push(seal);
}
function awardSeal(r) {
  award(
    r,
    current(r).type === "charge"
      ? { name: "Vuelo", digit: "7" }
      : puzzles[current(r).id]?.seal,
  );
}
export function win(r, p, now = Date.now()) {
  if (
    r.closed ||
    r.round.winners.some((w) => w.id === p.id) ||
    !r.roster.includes(p.id)
  )
    return false;
  const elapsed = Math.max(0, now - r.startedAt);
  p.score += POINTS;
  p.solveTime += elapsed;
  r.round.winners.push({ id: p.id, name: p.name, points: POINTS, elapsed });
  if (r.round.winners.length >= r.target) {
    r.closed = true;
    r.advanceAt = now + TRANSITION_MS;
    awardSeal(r);
  }
  return true;
}
export function submit(r, p, value, sceneId, now = Date.now()) {
  if (sceneId !== current(r).id) throw Error("Ese capítulo ya terminó.");
  if (current(r).type !== "puzzle" || r.closed)
    throw Error("El cupo de este puzzle está cerrado.");
  if (r.round.winners.some((w) => w.id === p.id))
    throw Error("Ya ganaste puntos en este puzzle.");
  if (!r.roster.includes(p.id))
    throw Error("No estás inscrito en esta partida.");
  const puzzle = puzzles[sceneId];
  if (!puzzle.choices.some((c) => c.id === value))
    throw Error("Opción inválida.");
  if (now < (r.round.cooldowns[p.id] || 0))
    throw Error("Esperá cuatro segundos antes de intentar otra vez.");
  r.round.attempts[p.id] = (r.round.attempts[p.id] || 0) + 1;
  r.round.cooldowns[p.id] = now + RETRY_MS;
  if (value !== puzzle.correct) return false;
  win(r, p, now);
  return true;
}
export function assist(r, now = Date.now()) {
  if (!competitive(r) || r.closed) return;
  r.round.assisted = true;
  r.closed = true;
  r.advanceAt = now + TRANSITION_MS;
  awardSeal(r);
}
export function advance(r, skip = false, now = Date.now()) {
  const s = current(r);
  if (r.step >= r.route.length - 1) return;
  if (s.type === "lobby") {
    if (!r.players.length) throw Error("Esperá al menos un jugador.");
    r.roster = r.players.map((p) => p.id);
    r.target = Math.ceil(r.roster.length / 2);
  }
  if (s.type === "proposal" && !r.approved.length) {
    if (!skip) throw Error("Aprobá al menos una propuesta.");
    r.proposals.fallback = "Derecho a llegar de goma el 26";
    r.approved = ["fallback"];
  }
  if (competitive(r) && !r.closed) {
    if (!skip)
      throw Error("Esperá a completar el cupo o saltá sin dar puntos.");
    assist(r, now);
  }
  r.history.push({
    id: s.id,
    ...result(r),
    scorers: r.round.winners.map((w) => ({ ...w })),
    assisted: r.round.assisted,
  });
  r.step++;
  r.closed = false;
  r.votes = {};
  r.round = {
    winners: [],
    attempts: {},
    cooldowns: {},
    charges: {},
    hint: 0,
    assisted: false,
  };
  r.advanceAt = null;
  r.startedAt = now;
  r.extraSeconds = 0;
  r.players.forEach((p) => (p.holding = false));
}
export function tickCharge(r, now = Date.now()) {
  if (current(r).type !== "charge" || r.closed) return;
  for (const p of [...r.players].sort(
    (a, b) =>
      (a.holdStarted || Infinity) - (b.holdStarted || Infinity) ||
      a.joinOrder - b.joinOrder,
  )) {
    if (r.closed) break;
    if (!p.online || r.round.winners.some((w) => w.id === p.id)) continue;
    if (now - (p.lastHold || 0) > 1500) p.holding = false;
    const c = (r.round.charges[p.id] ??= {
      energy: 0,
      phase: "first",
      releaseTicks: 0,
    });
    if (c.phase === "release") {
      c.releaseTicks = !p.holding ? c.releaseTicks + 1 : 0;
      if (c.releaseTicks >= 4) c.phase = "second";
    } else if (p.holding) {
      c.energy = Math.min(100, c.energy + 2.5);
      if (c.phase === "first" && c.energy >= 50) {
        c.energy = 50;
        c.phase = "release";
      }
      if (c.energy >= 100) {
        c.phase = "done";
        win(r, p, now);
      }
    }
  }
}
export function tick(r, now = Date.now()) {
  if (r.advanceAt && now >= r.advanceAt) {
    advance(r, false, now);
    return true;
  }
  if (current(r).type === "charge" && !r.closed) {
    tickCharge(r, now);
    return true;
  }
  return false;
}
export function ranking(r) {
  return [...r.players]
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.solveTime - b.solveTime ||
        a.joinOrder - b.joinOrder,
    )
    .map((p, i) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      rank: i + 1,
      solveTime: p.solveTime,
      isGrinch: i === r.players.length - 1,
    }));
}
export function snapshot(r, host = false, playerId) {
  const s = current(r),
    p = r.players.find((p) => p.id === playerId),
    winner = r.round.winners.some((w) => w.id === playerId);
  return {
    code: r.code,
    mode: r.mode,
    scene: s.id,
    step: r.step,
    route: r.route,
    closed: r.closed,
    players: r.players.map((p) => ({
      id: p.id,
      name: p.name,
      online: p.online,
      job: jobs[p.jobIndex],
      score: p.score,
    })),
    responded: Object.keys(r.votes).length,
    myVote: p ? r.votes[p.id] : undefined,
    myProposal: p ? r.proposals[p.id] : undefined,
    options: options(r),
    results: r.closed ? result(r) : null,
    proposals: host ? r.proposals : undefined,
    approved: host ? r.approved : undefined,
    ready: r.ready,
    history: r.history,
    seals: r.seals,
    target: r.target || Math.ceil(r.players.length / 2),
    winners: r.round.winners,
    advanceAt: r.advanceAt,
    serverNow: Date.now(),
    ranking: ranking(r),
    myCharge: r.round.charges[playerId] || { energy: 0, phase: "first" },
    myWon: winner,
    assisted: r.round.assisted,
    puzzle: s.type === "puzzle" ? puzzleView(s.id, r.round, p, r.closed) : null,
    startedAt: r.startedAt,
    durationSeconds: (s.minutes || 0) * 60 + r.extraSeconds,
  };
}
