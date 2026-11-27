# Northstar Live - Operación Nochebuena

Individual realtime Christmas competition for up to 20 players, designed for 14 friends. React + Vite, Node.js + Socket.IO, original animated SVG cast.

## Local network

Requires Node.js 22.12+. Run `npm install` and `npm run dev`. Open Vite's Network URL on the laptop and phones on the same Wi-Fi. Vite listens on port 5173 and proxies Socket.IO to the Node backend on port 3001. Use the laptop IP rather than localhost on phones. The QR base address is editable by the host.

`npm test` runs the test suite. `npm run build` produces the frontend; `npm start` serves it through Node on port 3001 (`PORT` can override). The app needs a WebSocket-capable Node host, not static GitHub Pages.

## Competitive rules

- No pairs or teams. Every player gets all the clues and answers independently.
- The host starts after everyone has joined. Enrollment then closes; existing in-memory player tokens can reconnect.
- The winning quota is `ceil(enrolled players / 2)`, frozen for the whole game: 14 players means seven winning slots per puzzle. Disconnecting does not reduce it.
- Each of the first quota-sized correct submissions earns 100 points once per puzzle. Invalid, wrong, duplicate, stale-scene and post-close submissions do not score. Wrong attempts have a four-second retry cooldown.
- Seven multiple-choice puzzles plus an individual hold/release/hold charging challenge. Maximum 800 points on the full route; 300 on the short route.
- When the quota fills, answers close immediately. A five-second result window precedes automatic advancement by the server. The correct choice becomes visible only after closure.
- The host can skip a stuck challenge. Already awarded points remain; remaining players get no free points.
- Creative proposals, opinion votes and the final light ceremony have no correct answer and give no points. These scenes remain presenter-controlled.
- Final ranking: descending points, then ascending accumulated solve time, then registration order. Ornaments display nicknames and scores from top to bottom; the last place gets a Grinch face. The equivalent score table is expandable.
- Server reception order resolves simultaneous quiz submissions. Charge completions in the same server tick use hold start time, then registration order.

## Session and privacy

Only `northstar-nickname` is saved to browser sessionStorage. No game credentials, jobs, scores or roles are persisted in browser storage. The 14 fictional employment cards in `shared/jobs.js` are assigned randomly without repeating the initial 14 assignments.

Network reconnection works while the page remains open. A full page reload loses the player token and cannot reclaim a running-game identity using just a nickname. Do not reload during a round. The host can manually copy the private recovery key and re-enter it after refreshing their panel; no key is saved by the app. Before starting, disconnected entries can be removed. Once started, records and quota remain fixed.

## Answer guide

The private PDF is generated from the actual server answer catalog. It includes all seven questions, their four options with the correct one marked, the charging protocol, and a section explaining non-scored narrative decisions.

```sh
node scripts/export-answer-guide.mjs
python scripts/build-answer-guide.py
```

The Python script requires ReportLab and Windows Arial fonts. Final output: `output/pdf/northstar-live-guia-de-puzzles.pdf`. Generated output and temporary renders are ignored by Git and are not served to players.

## Architecture

- `shared/story.js`: scenes and short/full routes.
- `server/puzzles.js`: private answer bank and personalized snapshots.
- `server/game.js`: quota, scoring, transitions, charging and ranking.
- `server/index.js`: Socket.IO authorization and server tick.
- `src/Puzzle.jsx`: individual multiple-choice interface.
- `src/RankingTree.jsx`: ordered ornaments and score table.
- `src/Stage.jsx`: Santa, Rodolfo, Yelba and Kevin, locations and reactions.
- `src/session.js`: nickname-only session handling.

Tests cover exact seven-of-fourteen awards, late/duplicate/stale submissions, retry cooldown, odd quotas, disconnections, automatic advancement, host skips, charge behavior, deterministic ranking and nickname-only persistence.

## Boundaries

Rooms and scores live in server memory and disappear after restart. Use one server instance on a trusted local network; this is not hardened for unrestricted public hosting. Timers are advisory. Short/full duration estimates depend on player speed. Google Fonts have system fallbacks. Reduced motion is supported. No voice acting or prerecorded films. No license has been granted yet.
