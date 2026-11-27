// The nickname is the only browser-persisted value. All room credentials live in memory.
export function loadNickname(storage) {
  try {
    return storage.getItem("northstar-nickname") || "";
  } catch {
    return "";
  }
}
export function saveNickname(storage, name) {
  try {
    storage.setItem("northstar-nickname", name.trim());
  } catch {
    /* Private browsing may disable storage. */
  }
}
export function clearLegacyCredentials(session, local) {
  try {
    session.removeItem("northstar-host");
    Object.keys(local)
      .filter((k) => /^northstar-[A-F\d]{6}$/i.test(k))
      .forEach((k) => local.removeItem(k));
  } catch {}
}
