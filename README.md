# Northstar Live

Real-time multiplayer event platform built with React, Node.js and Socket.IO. Its first experience, **Santa.exe — Navidad en producción**, turns a Christmas gathering into a cooperative incident-response game.

## Run locally

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev
```

Open http://localhost:5173, create a room, and open the audience screen in a separate tab. The presenter controls pacing. Players join with a six-character room code and nickname.

For phones, use the laptop's LAN IP (for example `http://192.168.1.20:5173`) on the same Wi-Fi. Enter that address in the presenter's QR address field. `localhost` on a phone refers to the phone, not the laptop. The network must permit access to the Vite server; do not disable the firewall globally.

## Production build

```sh
npm run build
npm start
```

One Node process serves the frontend and WebSocket connections on port 3001 (override with `PORT`). Deploy on a Node host with WebSocket support and HTTPS. This is not a static GitHub Pages application.

## First playable release

- Host, audience and mobile player views; QR joining.
- Balanced teams, up to 20 players; designed for 14 friends.
- Server-authoritative votes, hidden tallies until reveal, repeat-vote replacement.
- Private proposal moderation and public shortlist voting.
- Cooperative hold-to-charge challenge with stale-input timeout.
- Shared finale, reconnection tokens, presenter recovery in the same browser tab.
- Presenter-only actions validated on the server; host keys never broadcast.
- Responsive interface, keyboard controls and reduced-motion support.

## Scope and limitations

This MVP uses in-memory rooms: restarting the server clears games. Use one server instance; it is not yet suitable for an unrestricted public service. There are no accounts, persistent scores or durable recovery. The presenter manually advances scenes, resolves ties aloud and may bypass a challenge. No CAPTCHA minigame, synchronized sound, automatic countdown, personalized awards or hold/release reversal yet. The audience screen currently uses its own origin for the QR; open it using the LAN/public address when projecting. External Google Fonts are optional; system fallbacks work without internet.

Do not share the presenter browser session. For the event, rehearse with the actual Wi-Fi, screen and phones before guests arrive. Use `npm test` for domain and 14-client Socket.IO integration checks.

## Structure

`src/`: React interface and styling. `shared/story.js`: Spanish scenes and outcomes. `server/game.js`: domain rules and public/private snapshots. `server/index.js`: HTTP and realtime transport. `test/`: game and integration tests.

## Next milestones

1. Rehearse on the venue network and refine pacing with real players.
2. Add sound, coordinated release phase and a richer animated finale.
3. Add durable room recovery, expiration and deployment configuration.

No license has been granted yet; choose one before inviting external reuse.
