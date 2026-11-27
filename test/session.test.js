import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadNickname,
  saveNickname,
  clearLegacyCredentials,
} from "../src/session.js";
function storage(values = {}) {
  return Object.assign(
    Object.create({
      getItem(k) {
        return this[k] ?? null;
      },
      setItem(k, v) {
        this[k] = v;
      },
      removeItem(k) {
        delete this[k];
      },
    }),
    values,
  );
}
test("only nickname is retained; prototype credentials are removed without touching unrelated storage", () => {
  const session = storage({
      "northstar-host": "old-secret",
      unrelated: "keep",
    }),
    local = storage({
      "northstar-A1B2C3": "old-player-token",
      unrelated: "keep",
    });
  clearLegacyCredentials(session, local);
  saveNickname(session, " Kevin ");
  assert.equal(loadNickname(session), "Kevin");
  assert.deepEqual(Object.keys(session).sort(), [
    "northstar-nickname",
    "unrelated",
  ]);
  assert.deepEqual(Object.keys(local), ["unrelated"]);
});
test("disabled storage does not prevent playing", () => {
  const blocked = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
    removeItem() {
      throw Error();
    },
  };
  assert.equal(loadNickname(blocked), "");
  assert.doesNotThrow(() => saveNickname(blocked, "Kevin"));
  assert.doesNotThrow(() => clearLegacyCredentials(blocked, blocked));
});
