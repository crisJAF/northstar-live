# Northstar Live — Operación Nochebuena

A cooperative, realtime Christmas adventure for 14 friends (seven pairs). React + Vite, Node.js + Socket.IO. Original articulated SVG characters and Spanish dialogue with Nicaraguan humor.

## Run on the local network

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Vite binds to `0.0.0.0:5173` and proxies Socket.IO to `127.0.0.1:3001`. Open the **Network** URL printed by Vite on the laptop and phones connected to the same Wi-Fi. Do not use localhost on a phone. The presenter can edit the QR base URL; the audience-screen link carries that address too. The server must be reachable through the local firewall and the Wi-Fi must permit device-to-device connections.

```sh
npm test
npm run build
npm start
```

The production build is served by Node on port 3001 (`PORT` overrides it). This needs a Node/WebSocket host; it is not a GitHub Pages static app.

## Experience

- Full adventure: intended for 30–40 minutes; short route: 15–20 minutes. Real duration depends on the group and presenter.
- Symbol-order password with distributed clues.
- Two-round electrical panel: operators cannot see the manual; technicians cannot submit. Roles swap after the first solution.
- Budget negotiation, private moderation and public voting for a custom labor clause.
- Gift-to-city deduction and startup-sequence reconstruction.
- Hold/release/hold cooperative charging with expired-input detection.
- Audit requiring chronological order, culprit and decisive evidence.
- Three earned seals unlock the final reboot code; shared lights and final resolutions.
- Timers are advisory, with presenter controls for extra time, three hints, assisted solutions and explicit skips.
- Santa, Rodolfo, Yelba and Kevin animate while waiting and react to attempts and success. Four illustrated locations, snow, conveyor gifts, sleigh movement and finale confetti. Reduced motion is respected.

## Employment catalog and session behavior

`shared/jobs.js` contains the hardcoded decorative jobs, experience and hiring reasons. The server assigns a random catalog entry at join, without repeating the first 14 assignments. No job influences permissions or puzzle difficulty.

**Only the nickname is stored in browser sessionStorage**, under `northstar-nickname`. No room keys, roles, jobs or player tokens are written to localStorage, sessionStorage, cookies or a database. Legacy prototype credential entries are removed. The active room and credentials exist in memory only.

A brief network interruption reconnects the same player while the page remains open. A full reload intentionally loses that player credential. The presenter can remove the disconnected entry so the same nickname can join again with a fresh card. Active duplicate nicknames are rejected rather than impersonating someone by name. The host can manually copy their recovery key from the private panel and re-enter it after reloading; the app does not persist it. Never project that private panel.

## Presenter flow

1. Create a room and select a duration.
2. Open **Pantalla del público** on the projector. Keep the host panel private.
3. Invite players via QR, wait for everyone, and ask them to find their numbered pair.
4. Start the adventure. Players share clues aloud and submit solutions from phones.
5. Use hints before assisted skips. Choose 1–4 proposals before opening the vote.
6. Advance manually after the shared light ceremony.

## Architecture and verification

- `shared/story.js`: public narrative, routes and choice labels.
- `shared/jobs.js`: fixed fictional employment catalog.
- `server/puzzles.js`: private answers, clue distribution, validation and hint ladders. Not imported into the client bundle.
- `server/game.js`: authoritative state transitions and recipient-specific snapshots.
- `server/index.js`: realtime transport, host authorization and charge tick.
- `src/Stage.jsx`: original vector cast and locations.
- `src/Puzzle.jsx`: accessible puzzle controls.
- `src/session.js`: nickname-only persistence and prototype migration.
- `test/`: uniqueness, privacy, role switching, charging, moderation, storage and full 14-client integration checks.

## Current boundaries

Rooms are in memory and disappear on server restart; use one server instance. No accounts, durable scores or automatic room expiry. The app is intended for a trusted gathering on a local network, not an unrestricted public service. Capacity is 20, with content designed for 14. Hints let the presenter recover from missing participants. Google Fonts are optional, with system font fallback. Character motion is procedural SVG/CSS, not prerecorded films or voice acting. Rehearse on the actual phones and venue Wi-Fi.

No license has been granted yet.
