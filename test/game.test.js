import { test } from "node:test";
import assert from "node:assert/strict";
import { io } from "socket.io-client";
import {
  createRoom,
  join,
  vote,
  advance,
  snapshot,
  submit,
  current,
  tickCharge,
  assist,
} from "../server/game.js";
import { puzzles } from "../server/puzzles.js";
import { jobs } from "../shared/jobs.js";
import { createApp } from "../server/index.js";
const go = (r, id) => {
  r.step = r.route.indexOf(id);
};
function permutations(a) {
  return a.length
    ? a.flatMap((v, i) =>
        permutations(a.filter((_, j) => i !== j)).map((t) => [v, ...t]),
      )
    : [[]];
}
test("14 players: balanced teams, seven pairs, catalog cards without repeats and private tokens", () => {
  const r = createRoom();
  for (let i = 0; i < 14; i++) join(r, "Player " + i);
  assert.equal(r.players.filter((p) => p.team === 0).length, 7);
  assert.equal(new Set(r.players.map((p) => p.pair)).size, 7);
  assert.equal(new Set(r.players.map((p) => p.jobIndex)).size, 14);
  assert.equal(join(r, "Again", r.players[0].token).id, r.players[0].id);
  assert.equal(r.players.length, 14);
  assert.throws(() => join(r, "Player 0"));
  const pub = JSON.stringify(snapshot(r));
  assert.ok(!pub.includes(r.players[0].token));
  assert.ok(!pub.includes(r.hostKey));
  assert.ok(jobs.some((j) => j.title === snapshot(r).players[0].job.title));
});
test("access clues and gift clues each have exactly one solution", () => {
  const access = permutations(puzzles.access.choices).filter(
    (a) =>
      a[0] === "Reno" &&
      a[1] === "Regalo" &&
      a[2] === "Copo" &&
      a.indexOf("Campana") === a.indexOf("Estrella") + 1 &&
      a[5] === "Bastón" &&
      a[2] !== "Campana",
  );
  assert.deepEqual(access, [puzzles.access.answer]);
  const gifts = permutations(puzzles.gifts.choices).filter(
    (a) =>
      a[0] === "Bicicleta" &&
      a[1] === "Parlante" &&
      a[2] !== "Bufanda" &&
      a[3] !== "Libro" &&
      a[3] !== "Parlante",
  );
  assert.deepEqual(gifts, [puzzles.gifts.answer]);
});
test("private clues are distributed, solutions are not broadcast, and assistance awards seals", () => {
  const r = createRoom();
  for (let i = 0; i < 14; i++) join(r, "P" + i);
  go(r, "access");
  const all = new Set();
  for (const p of r.players) {
    const view = snapshot(r, false, p.id);
    assert.equal(view.puzzle.clues.length, 1);
    view.puzzle.clues.forEach((c) => all.add(c));
    assert.equal(view.puzzle.answer, undefined);
  }
  assert.equal(all.size, 7);
  assert.equal(snapshot(r).puzzle.clues.length, 0);
  assert.equal(snapshot(r, true).puzzle.clues.length, 7);
  assert.throws(() => advance(r));
  advance(r, true);
  assert.equal(r.seals[0].digit, "4");
});
test("circuit roles swap only after a correct first sequence", () => {
  const r = createRoom();
  const a = join(r, "A"),
    b = join(r, "B");
  go(r, "circuits");
  assert.equal(snapshot(r, false, a.id).puzzle.clues.length, 0);
  assert.equal(snapshot(r, false, b.id).puzzle.clues.length, 7);
  assert.throws(() => submit(r, b, puzzles.circuits.answers[0]));
  submit(r, a, ["Regalo"]);
  assert.equal(r.puzzle.stage, 0);
  submit(r, a, puzzles.circuits.answers[0]);
  assert.equal(r.puzzle.stage, 1);
  assert.throws(() => submit(r, a, puzzles.circuits.answers[1]));
  submit(r, b, puzzles.circuits.answers[1]);
  assert.equal(r.puzzle.solved, true);
});
test("budget refuses duplicates and audit requires both sequence and evidence", () => {
  const r = createRoom();
  const p = join(r, "P");
  go(r, "budget");
  submit(r, p, ["pay", "rest", "bus", "pay"]);
  assert.equal(r.puzzle.solved, false);
  submit(r, p, ["pay", "rest", "bus"]);
  assert.equal(r.puzzle.solved, true);
  advance(r);
  go(r, "audit");
  submit(r, p, {
    order: puzzles.audit.answer,
    culprit: "Santa",
    evidence: "Rodolfo estaba de goma",
  });
  assert.equal(r.puzzle.solved, false);
  submit(r, p, {
    order: puzzles.audit.answer,
    culprit: "Santa",
    evidence: "Registro de 17 clics",
  });
  assert.equal(r.puzzle.solved, true);
});
test("charge requires both teams, release and refreshed hold; stale holds expire", () => {
  const r = createRoom();
  const a = join(r, "A"),
    b = join(r, "B");
  go(r, "charge");
  a.online = b.online = true;
  a.holding = true;
  a.lastHold = 100;
  tickCharge(r, 100);
  assert.equal(r.energy, 0);
  b.holding = true;
  b.lastHold = 100;
  for (let i = 0; i < 20; i++) tickCharge(r, 100);
  assert.equal(r.energy, 50);
  assert.equal(r.chargePhase, "release");
  for (let i = 0; i < 10; i++) tickCharge(r, 100);
  assert.equal(r.chargePhase, "release");
  a.holding = b.holding = false;
  for (let i = 0; i < 4; i++) tickCharge(r, 100);
  assert.equal(r.chargePhase, "second");
  a.holding = b.holding = true;
  tickCharge(r, 2000);
  assert.equal(r.energy, 50);
  a.holding = b.holding = true;
  a.lastHold = b.lastHold = 2000;
  for (let i = 0; i < 20; i++) tickCharge(r, 2000);
  assert.equal(r.energy, 100);
  assert.equal(r.seals[0].name, "Vuelo");
});
test("moderation, ballot confidentiality, vote replacement and closed voting", () => {
  const r = createRoom();
  go(r, "proposal");
  r.proposals.p = "Aguinaldo";
  assert.equal(snapshot(r).proposals, undefined);
  assert.throws(() => advance(r));
  r.approved = ["p"];
  advance(r);
  vote(r, "a", "p");
  vote(r, "a", "p");
  assert.equal(snapshot(r).responded, 1);
  assert.equal(snapshot(r).results, null);
  r.closed = true;
  assert.throws(() => vote(r, "a", "p"));
  assert.equal(snapshot(r).results.winners[0].id, "p");
});
test("short route skips advanced puzzles and can finish with explicit host assistance", () => {
  const r = createRoom("short");
  assert.ok(!r.route.includes("audit"));
  while (current(r).type !== "final") advance(r, true);
  assert.equal(current(r).id, "final");
  assert.ok(r.history.some((h) => h.assisted));
});
test("real sockets: 14 clients play every chapter; host actions and clues stay private", async () => {
  const app = createApp();
  await new Promise((r) => app.http.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + app.http.address().port;
  const clients = [];
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
    let latest;
    host.on("state", (s) => (latest = s));
    const room = await act(host, { type: "create" });
    const players = [];
    for (let i = 0; i < 14; i++) {
      const s = await connect();
      const p = await act(s, {
        type: "join",
        code: room.code,
        name: "Tester " + i,
      });
      assert.ok(p.ok);
      players.push({ s, ...p });
    }
    assert.equal((await act(players[0].s, { type: "hint" })).ok, false);
    await act(host, { type: "next" });
    for (const id of [
      "access",
      "circuits",
      "budget",
      "proposal",
      "ballot",
      "gifts",
      "sequence",
      "charge",
      "audit",
      "punishment",
      "reboot",
      "ready",
    ]) {
      if (id === "circuits") {
        assert.ok(
          (
            await act(players[0].s, {
              type: "solve",
              value: puzzles[id].answers[0],
            })
          ).ok,
        );
        assert.ok(
          (
            await act(players[1].s, {
              type: "solve",
              value: puzzles[id].answers[1],
            })
          ).ok,
        );
      } else if (puzzles[id]) {
        const value =
          id === "audit"
            ? {
                order: puzzles[id].answer,
                culprit: "Santa",
                evidence: "Registro de 17 clics",
              }
            : puzzles[id].answer;
        assert.ok((await act(players[0].s, { type: "solve", value })).ok);
      } else if (id === "proposal") {
        await act(players[0].s, {
          type: "proposal",
          text: "Aguinaldo en efectivo",
        });
        await act(host, { type: "approve", id: players[0].id });
      } else if (id === "ballot" || id === "punishment") {
        for (const p of players)
          await act(p.s, {
            type: "vote",
            value: id === "ballot" ? players[0].id : "2",
          });
        await act(host, { type: "close" });
        assert.equal(
          (await act(players[0].s, { type: "vote", value: "2" })).ok,
          false,
        );
      } else if (id === "charge") await act(host, { type: "assist" });
      else if (id === "ready")
        for (const p of players) await act(p.s, { type: "ready" });
      assert.ok((await act(host, { type: "next" })).ok, "advance after " + id);
    }
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(latest.scene, "final");
    assert.equal(latest.seals.length, 3);
    assert.equal(latest.ready.length, 14);
  } finally {
    clients.forEach((s) => s.disconnect());
    app.close();
  }
});
