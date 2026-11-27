import { test } from "node:test";
import assert from "node:assert/strict";
import { io } from "socket.io-client";
import {
  createRoom,
  join,
  current,
  advance,
  submit,
  snapshot,
  ranking,
  tick,
  tickCharge,
  assist,
  POINTS,
  TRANSITION_MS,
} from "../server/game.js";
import { puzzles } from "../server/puzzles.js";
import { createApp } from "../server/index.js";
function setup(n = 14) {
  const r = createRoom();
  for (let i = 0; i < n; i++) {
    const p = join(r, "Player " + i);
    p.online = true;
  }
  advance(r, false, 10000);
  return r;
}
test("exactly seven of fourteen win; duplicates and late answers cannot score", () => {
  const r = setup();
  for (let i = 0; i < 7; i++)
    assert.equal(
      submit(r, r.players[i], puzzles.access.correct, "access", 11000 + i),
      true,
    );
  assert.equal(r.target, 7);
  assert.equal(r.closed, true);
  assert.equal(r.round.winners.length, 7);
  assert.equal(
    r.players.reduce((s, p) => s + p.score, 0),
    700,
  );
  assert.throws(() =>
    submit(r, r.players[7], puzzles.access.correct, "access", 12000),
  );
  assert.throws(() =>
    submit(r, r.players[0], puzzles.access.correct, "access", 12000),
  );
  assert.equal(r.players[7].score, 0);
  assert.equal(r.players[0].score, 100);
});
test("wrong choices, cooldown, invalid choice, and replay from a previous scene", () => {
  const r = setup(4),
    p = r.players[0];
  assert.throws(() => submit(r, p, "X", "access", 11000));
  assert.equal(submit(r, p, "A", "access", 11000), false);
  assert.equal(p.score, 0);
  assert.throws(() => submit(r, p, "B", "access", 12000));
  submit(r, p, "B", "access", 15000);
  assert.throws(() => submit(r, p, "B", "access", 20000));
  submit(r, r.players[1], "B", "access", 16000);
  tick(r, r.advanceAt);
  assert.equal(current(r).id, "circuits");
  assert.throws(() => submit(r, p, puzzles.circuits.correct, "access", 22000));
});
test("odd counts round up; frozen roster survives disconnects; new enrollments close", () => {
  for (const n of [1, 3, 13, 14, 15]) {
    const r = setup(n);
    assert.equal(r.target, Math.ceil(n / 2));
    r.players[0].online = false;
    assert.equal(r.target, Math.ceil(n / 2));
    assert.throws(() => join(r, "Late"));
    assert.equal(join(r, "Existing", r.players[0].token).id, r.players[0].id);
  }
});
test("five-second transition happens once, clears round and retains points/seals", () => {
  const r = setup(2);
  submit(r, r.players[0], "B", "access", 12000);
  assert.equal(r.advanceAt, 12000 + TRANSITION_MS);
  tick(r, 16999);
  assert.equal(current(r).id, "access");
  tick(r, 17000);
  assert.equal(current(r).id, "circuits");
  tick(r, 17001);
  assert.equal(current(r).id, "circuits");
  assert.equal(r.round.winners.length, 0);
  assert.equal(r.players[0].score, 100);
  assert.equal(r.seals[0].digit, "4");
});
test("private answer keys stay hidden until closure; attempts are individual", () => {
  const r = setup(4);
  submit(r, r.players[0], "A", "access", 11000);
  const a = snapshot(r, false, r.players[0].id),
    b = snapshot(r, false, r.players[1].id);
  assert.equal(a.puzzle.attempts, 1);
  assert.equal(b.puzzle.attempts, 0);
  assert.equal(a.puzzle.correct, undefined);
  assert.equal(snapshot(r, true).puzzle.correct, undefined);
  assert.deepEqual(a.puzzle.clues, b.puzzle.clues);
  assert.ok(!JSON.stringify(b).includes(r.players[0].token));
  assert.ok(!JSON.stringify(b).includes(r.hostKey));
});
test("assistance preserves earned points but never awards remaining slots", () => {
  const r = setup();
  submit(r, r.players[0], "B", "access", 11000);
  assist(r, 12000);
  assert.equal(r.round.winners.length, 1);
  assert.equal(
    r.players.reduce((n, p) => n + p.score, 0),
    100,
  );
  assert.equal(r.closed, true);
  tick(r, 17000);
  assert.equal(current(r).id, "circuits");
  assert.equal(r.history.at(-1).assisted, true);
});
test("individual charge enforces release and gives at most the quota rewards", () => {
  const r = setup(4);
  r.step = r.route.indexOf("charge");
  const a = r.players[0],
    b = r.players[1];
  a.holding = b.holding = true;
  a.lastHold = b.lastHold = 10000;
  for (let i = 0; i < 20; i++) tickCharge(r, 10000);
  assert.equal(r.round.charges[a.id].energy, 50);
  for (let i = 0; i < 10; i++) tickCharge(r, 10000);
  assert.equal(r.round.charges[a.id].phase, "release");
  a.holding = b.holding = false;
  for (let i = 0; i < 4; i++) tickCharge(r, 10000);
  a.holding = b.holding = true;
  for (let i = 0; i < 20; i++) tickCharge(r, 10000);
  assert.equal(r.round.winners.length, 2);
  assert.equal(a.score, 100);
  assert.equal(r.players[2].score, 0);
  assert.equal(r.closed, true);
});
test("ranking sorts points, elapsed time and entry order; only last is Grinch", () => {
  const r = setup(4);
  Object.assign(r.players[0], { score: 100, solveTime: 300 });
  Object.assign(r.players[1], { score: 200, solveTime: 400 });
  Object.assign(r.players[2], { score: 100, solveTime: 200 });
  const ranks = ranking(r);
  assert.deepEqual(
    ranks.map((p) => p.name),
    ["Player 1", "Player 2", "Player 0", "Player 3"],
  );
  assert.equal(ranks.filter((p) => p.isGrinch).length, 1);
  assert.equal(ranks.at(-1).isGrinch, true);
});
test("all catalog questions have four distinct choices and one valid key", () => {
  for (const p of Object.values(puzzles)) {
    assert.equal(p.choices.length, 4);
    assert.equal(new Set(p.choices.map((c) => c.label)).size, 4);
    assert.equal(p.choices.filter((c) => c.id === p.correct).length, 1);
  }
});
test("real sockets: fourteen competing answers produce exactly seven awards and auto advance", async () => {
  const app = createApp();
  await new Promise((r) => app.http.listen(0, "127.0.0.1", r));
  const clients = [];
  const url = "http://127.0.0.1:" + app.http.address().port;
  const connect = async () => {
    const s = io(url, { forceNew: true });
    clients.push(s);
    await new Promise((r) => s.on("connect", r));
    return s;
  };
  const act = (s, d) =>
    new Promise((resolve, reject) =>
      s.timeout(2000).emit("action", d, (e, r) => (e ? reject(e) : resolve(r))),
    );
  try {
    const host = await connect();
    let state;
    host.on("state", (s) => (state = s));
    const room = await act(host, { type: "create" });
    const players = [];
    for (let i = 0; i < 14; i++) {
      const s = await connect();
      await act(s, { type: "join", code: room.code, name: "P" + i });
      players.push(s);
    }
    assert.equal((await act(players[0], { type: "next" })).ok, false);
    await act(host, { type: "next" });
    const responses = await Promise.all(
      players.map((s) =>
        act(s, { type: "solve", scene: "access", value: "B" }),
      ),
    );
    assert.equal(responses.filter((r) => r.ok && r.correct).length, 7);
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(state.winners.length, 7);
    assert.equal(
      state.ranking.reduce((n, p) => n + p.score, 0),
      700,
    );
    assert.equal(state.closed, true);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(Error("No automatic transition")),
        6500,
      );
      const listener = (s) => {
        if (s.scene === "circuits") {
          clearTimeout(timer);
          host.off("state", listener);
          resolve();
        }
      };
      host.on("state", listener);
    });
    assert.equal(state.scene, "circuits");
  } finally {
    clients.forEach((s) => s.disconnect());
    app.close();
  }
});
