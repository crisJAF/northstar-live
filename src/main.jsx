import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";
import { scenes, teams } from "../shared/story.js";
import Stage from "./Stage.jsx";
import Puzzle from "./Puzzle.jsx";
import {
  loadNickname,
  saveNickname,
  clearLegacyCredentials,
} from "./session.js";
import "./style.css";
const socket = io(),
  query = new URLSearchParams(location.search);
// Migrate the prototype: never retain authentication or game data in browser storage.
try {
  clearLegacyCredentials(sessionStorage, localStorage);
} catch {}
function savedNickname() {
  try {
    return loadNickname(sessionStorage);
  } catch {
    return "";
  }
}
function App() {
  const [room, setRoom] = useState(null),
    [mode, setMode] = useState(query.get("screen") ? "screen" : "home"),
    [code, setCode] = useState(query.get("room") || ""),
    [name, setName] = useState(savedNickname),
    [error, setError] = useState(""),
    [connected, setConnected] = useState(socket.connected),
    [text, setText] = useState(""),
    [player, setPlayer] = useState(null),
    [joinBase, setJoinBase] = useState(query.get("join") || location.origin),
    [duration, setDuration] = useState("full"),
    [hostKey, setHostKey] = useState(""),
    [recoveryKey, setRecoveryKey] = useState(""),
    [now, setNow] = useState(Date.now()),
    [busy, setBusy] = useState(false);
  const resume = useRef(null),
    holding = useRef(false);
  const act = (data) =>
    new Promise((resolve) =>
      socket.timeout(5000).emit("action", data, (err, r) => {
        if (err) {
          setError("Sin respuesta del servidor. Revisá la conexión.");
          resolve(null);
          return;
        }
        if (!r.ok) setError(r.error);
        else setError("");
        resolve(r);
      }),
    );
  useEffect(() => {
    const state = (r) => setRoom(r);
    const on = () => {
      setConnected(true);
      if (resume.current) act(resume.current);
    };
    const off = () => {
      setConnected(false);
      holding.current = false;
    };
    socket.on("state", state);
    socket.on("connect", on);
    socket.on("disconnect", off);
    if (query.get("screen")) {
      resume.current = { type: "watch", code: query.get("room") };
      act(resume.current);
    }
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      socket.off("state", state);
      socket.off("connect", on);
      socket.off("disconnect", off);
      clearInterval(clock);
    };
  }, []);
  useEffect(() => {
    setText("");
    holding.current = false;
  }, [room?.scene]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (holding.current && socket.connected)
        act({ type: "hold", value: true });
    }, 500);
    const release = () => {
      if (holding.current) {
        holding.current = false;
        act({ type: "hold", value: false });
      }
    };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      clearInterval(timer);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
    };
  }, []);
  async function create() {
    setBusy(true);
    const r = await act({ type: "create", mode: duration });
    if (r?.ok) {
      resume.current = { type: "host", code: r.code, key: r.hostKey };
      setHostKey(r.hostKey);
      setCode(r.code);
      setMode("host");
    }
    setBusy(false);
  }
  async function restore(e) {
    e.preventDefault();
    const payload = {
      type: "host",
      code: code.toUpperCase(),
      key: recoveryKey.trim(),
    };
    if ((await act(payload))?.ok) {
      resume.current = payload;
      setHostKey(payload.key);
      setMode("host");
    }
  }
  async function enter(e) {
    e.preventDefault();
    setBusy(true);
    const payload = { type: "join", code: code.toUpperCase(), name };
    const r = await act(payload);
    if (r?.ok) {
      try {
        saveNickname(sessionStorage, name);
      } catch {}
      resume.current = { ...payload, token: r.token };
      setPlayer(r.id);
      setMode("player");
    }
    setBusy(false);
  }
  function hold(value) {
    holding.current = value;
    act({ type: "hold", value });
  }
  const scene = room && scenes.find((s) => s.id === room.scene),
    me = room?.players.find((p) => p.id === player),
    host = mode === "host";
  const joinUrl = joinBase.replace(/\/$/, "") + "/?room=" + room?.code;
  const winner = room?.results?.winners;
  const outcome =
    winner?.length === 1
      ? scene.outcomes?.[Number(winner[0].id)] || winner[0].label
      : winner?.length > 1
        ? "Empate técnico. Las dos resoluciones quedan registradas."
        : "Sin votos. Decide el presentador.";
  const remaining = room
    ? Math.max(
        0,
        room.durationSeconds - Math.floor((now - room.startedAt) / 1000),
      )
    : 0;
  const mood =
    room?.puzzle?.solved ||
    (room?.energy === 100 && scene?.type === "charge") ||
    scene?.type === "final"
      ? "celebrate"
      : room?.puzzle?.attempts > 0 && !room?.puzzle?.solved
        ? "oops"
        : "idle";
  return (
    <div className="app">
      <header>
        <a className="brand" href="/">
          ✳{" "}
          <span>
            NORTHSTAR <b>LIVE</b>
          </span>
        </a>
        <span className={"connection " + (connected ? "online" : "")}>
          {connected ? "Polo Norte conectado" : "Reconectando…"}
        </span>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
          <button onClick={() => setError("")}>Cerrar</button>
        </div>
      )}
      {mode === "home" ? (
        <main className="landing">
          <section>
            <div className="eyebrow">
              UNA AVENTURA COOPERATIVA · EDICIÓN NICARAGUA
            </div>
            <h1>
              El caos nunca
              <br />
              fue tan
              <br />
              <em>navideño.</em>
            </h1>
            <p className="intro">
              Santa tocó producción. Vos y tus amigos son el último respaldo de
              la Navidad.
            </p>
            <div className="tags">
              <span>14 amigos</span>
              <span>7 parejas</span>
              <span>Cero experiencia</span>
            </div>
            <Stage
              character="santa"
              setting="workshop"
              dialogue="¿Quién le dio permisos al gordo?"
              compact
            />
          </section>
          <section className="entry card">
            <span className="stamp">POLO NORTE · PERSONAL TEMPORAL</span>
            <h2>Entrá al equipo.</h2>
            <p className="muted">
              Tu contratación es dudosa. Tu misión, importante.
            </p>
            <form onSubmit={enter}>
              <label>
                Código de sala
                <input
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3"
                  autoCapitalize="characters"
                />
              </label>
              <label>
                Tu apodo
                <input
                  required
                  maxLength={24}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te dicen los majes?"
                />
              </label>
              <button className="primary" disabled={!connected || busy}>
                Recibir mi credencial
              </button>
            </form>
            <div className="divider">¿SOS QUIEN ORGANIZA?</div>
            <label>
              Duración
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="full">Aventura completa · 30–40 min</option>
                <option value="short">Misión corta · 15–20 min</option>
              </select>
            </label>
            <button
              className="secondary"
              onClick={create}
              disabled={!connected || busy}
            >
              Crear una sala
            </button>
            <details className="recover">
              <summary>Recuperar panel del presentador</summary>
              <form onSubmit={restore}>
                <label>
                  Código de sala
                  <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </label>
                <label>
                  Clave privada
                  <input
                    required
                    type="password"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                  />
                </label>
                <button>Recuperar panel</button>
              </form>
            </details>
            <small>Solo tu apodo se guarda durante esta sesión.</small>
          </section>
        </main>
      ) : !room ? (
        <main>
          <h1>Conectando con el Polo Norte…</h1>
          <a href="/">Volver al inicio</a>
        </main>
      ) : (
        <main className={"game " + (mode === "player" ? "mobile" : "")}>
          <div className="game-top">
            <span className="eyebrow">OPERACIÓN NOCHEBUENA / {scene.tag}</span>
            <span className="room-code">SALA {room.code}</span>
          </div>
          <div className="progress">
            {room.route.map((id, i) => (
              <span
                key={id}
                className={i <= room.step ? "active" : ""}
                title={scenes.find((s) => s.id === id).title}
              />
            ))}
          </div>
          <div className="game-grid">
            <section className="mission" key={scene.id}>
              <div className="chapter-meta">
                <span>
                  {room.step + 1} / {room.route.length}
                </span>
                {room.durationSeconds > 0 && (
                  <span>
                    {remaining
                      ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                      : "Tiempo orientativo cumplido"}{" "}
                    · sin eliminación
                  </span>
                )}
              </div>
              <h1>{scene.title}</h1>
              <Stage
                character={scene.character}
                setting={scene.setting}
                mood={mood}
                dialogue={
                  room.puzzle?.solved ? room.puzzle.feedback : scene.dialogue
                }
                revision={room.puzzle?.revision || 0}
                compact={mode === "player"}
                final={scene.type === "final"}
              />
              <p className="intro">{scene.text}</p>
              {room.seals.length > 0 && (
                <div className="seals" aria-label="Sellos recuperados">
                  {room.seals.map((s) => (
                    <span key={s.name}>
                      ✦ {s.name} <b>{s.digit}</b>
                    </span>
                  ))}
                </div>
              )}
              {me && (
                <details className="credential" open={scene.type === "lobby"}>
                  <summary>
                    <span className="badge-icon">✦</span>
                    <span>
                      <strong>{me.name}</strong>
                      <small>
                        Pareja {me.pair + 1} · {teams[me.team]}
                      </small>
                    </span>
                    <span className="credential-label">CREDENCIAL</span>
                  </summary>
                  <div className="credential-body">
                    <h3>{me.job.title}</h3>
                    <p>
                      <span>Experiencia</span>
                      {me.job.experience}
                    </p>
                    <p>
                      <span>Contratado por</span>
                      {me.job.hiredBy}
                    </p>
                    <div className="barcode" aria-hidden="true" />
                    <small>Puesto decorativo. Sueldo: espíritu navideño.</small>
                  </div>
                </details>
              )}
              {scene.type === "lobby" && (
                <>
                  <div className="players">
                    {room.players.map((p) => (
                      <div
                        key={p.id}
                        className={
                          "player-chip " + (!p.online ? "offline" : "")
                        }
                      >
                        <strong>{p.name}</strong>
                        <small>
                          Pareja {p.pair + 1} · {p.job.title}
                        </small>
                      </div>
                    ))}
                  </div>
                  {room.players.length === 0 && (
                    <p className="muted">
                      Todavía no ha llegado nadie a la entrevista.
                    </p>
                  )}
                  <p className="muted">
                    Buscá a tu pareja. Cada uno recibirá pistas y controles
                    durante la misión.
                  </p>
                </>
              )}
              {scene.type === "puzzle" && (
                <Puzzle
                  key={scene.id}
                  puzzle={room.puzzle}
                  act={act}
                  host={host}
                  connected={connected}
                />
              )}
              {["vote", "ballot"].includes(scene.type) && (
                <>
                  <div className="options">
                    {room.options.map((o, i) => (
                      <button
                        key={o.id}
                        className={room.myVote === o.id ? "selected" : ""}
                        disabled={
                          mode !== "player" || room.closed || !connected
                        }
                        onClick={() => act({ type: "vote", value: o.id })}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {o.label}
                        {room.closed && (
                          <b>
                            {
                              room.results.counts.find((c) => c.id === o.id)
                                ?.count
                            }{" "}
                            votos
                          </b>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="muted">
                    {room.responded} de {room.players.length} respondieron{" "}
                    {room.myVote !== undefined ? "· Tu voto está guardado" : ""}
                  </p>
                  {room.closed && <div className="result">{outcome}</div>}
                </>
              )}
              {scene.type === "proposal" && (
                <>
                  {mode === "player" ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await act({ type: "proposal", text });
                      }}
                    >
                      <label>
                        Tu cláusula
                        <textarea
                          maxLength={60}
                          value={text}
                          required
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Aguinaldo en efectivo, no en espíritu navideño."
                        />
                      </label>
                      <small>{text.length}/60 caracteres</small>
                      <button
                        className="primary"
                        disabled={room.closed || !connected}
                      >
                        {room.myProposal
                          ? "Actualizar propuesta"
                          : "Enviar al sindicato"}
                      </button>
                      {room.myProposal && (
                        <p role="status">
                          Enviada al presentador: {room.myProposal}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="terminal">
                      <p>El sindicato está redactando sus demandas.</p>
                      <small>
                        Solo las propuestas aprobadas llegarán a la votación.
                      </small>
                    </div>
                  )}
                </>
              )}
              {scene.type === "charge" && (
                <>
                  <div
                    className={
                      "charge-call " +
                      (room.chargePhase === "release" ? "release" : "")
                    }
                  >
                    {room.chargePhase === "release"
                      ? "¡SOLTÁ! Todos deben soltar"
                      : room.energy >= 100
                        ? "¡Trineo listo!"
                        : "¡SOSTENÉ! Los dos equipos juntos"}
                  </div>
                  <div
                    className="energy"
                    role="progressbar"
                    aria-label="Energía del trineo"
                    aria-valuenow={room.energy}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div style={{ width: room.energy + "%" }} />
                  </div>
                  <h2>{Math.round(room.energy)}% de espíritu navideño</h2>
                  <div className="team-counts">
                    {teams.map((t, i) => (
                      <div key={t}>
                        {t}
                        <strong>{room.holding[i]} sosteniendo</strong>
                        <small>
                          Meta:{" "}
                          {Math.min(
                            5,
                            Math.max(
                              1,
                              room.players.filter(
                                (p) => p.online && p.team === i,
                              ).length,
                            ),
                          )}
                        </small>
                      </div>
                    ))}
                  </div>
                  {mode === "player" && (
                    <button
                      className="primary hold"
                      disabled={room.energy >= 100 || !connected}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        hold(true);
                      }}
                      onPointerUp={() => hold(false)}
                      onPointerCancel={() => hold(false)}
                      onLostPointerCapture={() => hold(false)}
                      onKeyDown={(e) => {
                        if ([" ", "Enter"].includes(e.key) && !e.repeat) {
                          e.preventDefault();
                          hold(true);
                        }
                      }}
                      onKeyUp={() => hold(false)}
                      onBlur={() => hold(false)}
                    >
                      Mantené presionado · soltá cuando se indique
                    </button>
                  )}
                </>
              )}
              {["ready", "final"].includes(scene.type) && (
                <>
                  <div
                    className={
                      "light-tree " + (scene.type === "final" ? "complete" : "")
                    }
                    aria-label="Árbol de luces del equipo"
                  >
                    <span className="tree-star">★</span>
                    {[1, 3, 5, 7].map((count, row) => (
                      <div key={row}>
                        {Array.from({ length: count }, (_, i) => (
                          <i
                            key={i}
                            className={
                              scene.type === "final" ||
                              row * row + i < room.ready.length
                                ? "on"
                                : ""
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="players">
                    {room.players.map((p) => (
                      <span
                        key={p.id}
                        className={
                          "player-chip " +
                          (room.ready.includes(p.id) || scene.type === "final"
                            ? "lit"
                            : "offline")
                        }
                      >
                        ✦ {p.name}
                      </span>
                    ))}
                  </div>
                  {scene.type === "ready" && mode === "player" && (
                    <button
                      className="primary"
                      onClick={() => act({ type: "ready" })}
                      disabled={room.ready.includes(player) || !connected}
                    >
                      {room.ready.includes(player)
                        ? "Tu luz está encendida"
                        : "Encender mi luz"}
                    </button>
                  )}
                  {scene.type === "ready" && (
                    <p>
                      {room.ready.length} de {room.players.length} luces
                      encendidas
                    </p>
                  )}
                  {scene.type === "final" && (
                    <div className="result">
                      <h3>Acta oficial de Nochebuena</h3>
                      {room.history
                        .filter((h) => ["ballot", "punishment"].includes(h.id))
                        .map((h) => (
                          <p key={h.id}>
                            {h.winners.map((w) => w.label).join(" / ") ||
                              "Decisión delegada al presentador."}
                          </p>
                        ))}
                      <strong>Equipo de soporte del año: todos ustedes.</strong>
                    </div>
                  )}
                </>
              )}
            </section>
            {mode !== "player" && (
              <aside>
                <div className="card join">
                  <div className="eyebrow">ESCANEÁ PARA ENTRAR</div>
                  <div className="qr">
                    <QRCodeSVG value={joinUrl} size={150} />
                  </div>
                  <h2>{room.code}</h2>
                  <p>
                    {room.players.filter((p) => p.online).length} conectados ·{" "}
                    {room.players.length}/20
                  </p>
                  <a href={joinUrl} target="_blank" rel="noreferrer">
                    Entrada de jugadores
                  </a>
                </div>
                {host && (
                  <div className="card controls">
                    <div className="eyebrow">CONTROL DEL PRESENTADOR</div>
                    <a
                      href={
                        "/?screen=1&room=" +
                        room.code +
                        "&join=" +
                        encodeURIComponent(joinBase)
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir pantalla del público
                    </a>
                    <label>
                      Dirección de la red local
                      <input
                        value={joinBase}
                        onChange={(e) => setJoinBase(e.target.value)}
                      />
                    </label>
                    <small>
                      Usá la IP de la laptop para que los celulares puedan
                      entrar.
                    </small>
                    <details>
                      <summary>Clave privada de recuperación</summary>
                      <p className="host-key">{hostKey}</p>
                      <small>
                        No se guarda en el navegador. Copiala si querés
                        recuperar el panel después de recargar. No la proyectés.
                      </small>
                    </details>
                    {["vote", "ballot"].includes(scene.type) && (
                      <button
                        onClick={() => act({ type: "close" })}
                        disabled={room.closed}
                      >
                        Revelar resultados
                      </button>
                    )}
                    {scene.type === "proposal" && (
                      <div className="moderation">
                        {Object.entries(room.proposals || {}).map(
                          ([id, value]) => (
                            <button
                              className={
                                room.approved.includes(id) ? "selected" : ""
                              }
                              key={id}
                              onClick={() => act({ type: "approve", id })}
                            >
                              {room.approved.includes(id) ? "✓ " : ""}
                              {value}
                            </button>
                          ),
                        )}
                        <small>Seleccioná de una a cuatro propuestas.</small>
                      </div>
                    )}
                    {scene.type === "puzzle" && (
                      <>
                        <button
                          onClick={() => act({ type: "hint" })}
                          disabled={room.puzzle.hint >= 3 || room.puzzle.solved}
                        >
                          Revelar ayuda ({room.puzzle.hint}/3)
                        </button>
                        <button
                          onClick={() => act({ type: "assist" })}
                          disabled={room.puzzle.solved}
                        >
                          Resolver con ayuda
                        </button>
                      </>
                    )}
                    {scene.type === "charge" && (
                      <button onClick={() => act({ type: "assist" })}>
                        Aplicar empujón nicaragüense
                      </button>
                    )}
                    {room.durationSeconds > 0 && (
                      <button onClick={() => act({ type: "extend" })}>
                        Agregar un minuto
                      </button>
                    )}
                    {scene.type !== "final" && (
                      <>
                        <button
                          className="primary"
                          onClick={() => act({ type: "next" })}
                        >
                          {scene.type === "lobby"
                            ? "Iniciar aventura"
                            : "Continuar capítulo"}
                        </button>
                        <button
                          className="quiet"
                          onClick={() => act({ type: "skip" })}
                        >
                          Saltar con ayuda
                        </button>
                      </>
                    )}
                    <small>El tiempo orienta; nunca elimina a nadie.</small>
                    {room.players.some((p) => !p.online) && (
                      <details>
                        <summary>Jugadores desconectados</summary>
                        {room.players
                          .filter((p) => !p.online)
                          .map((p) => (
                            <button
                              key={p.id}
                              onClick={() => act({ type: "kick", id: p.id })}
                            >
                              Retirar a {p.name}
                            </button>
                          ))}
                      </details>
                    )}
                  </div>
                )}
              </aside>
            )}
          </div>
        </main>
      )}
      <footer>
        <span>NORTHSTAR LIVE</span>
        <span>Operación Nochebuena · Hecho para los majes</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
