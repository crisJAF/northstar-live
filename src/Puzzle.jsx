import React, { useState, useEffect } from "react";
import { teams } from "../shared/story.js";
export default function Puzzle({
  puzzle: p,
  act,
  host = false,
  connected = true,
}) {
  const [order, setOrder] = useState([]),
    [mapping, setMapping] = useState({}),
    [selected, setSelected] = useState([]),
    [code, setCode] = useState(""),
    [culprit, setCulprit] = useState(""),
    [evidence, setEvidence] = useState(""),
    [pending, setPending] = useState(false);
  useEffect(() => {
    setOrder([]);
  }, [p.stage]);
  const interactive = p.canSubmit && !p.solved && connected && !pending;
  async function send() {
    setPending(true);
    let value = order;
    if (p.kind === "budget") value = selected;
    if (p.kind === "mapping") value = p.fields.map((f) => mapping[f] || "");
    if (p.kind === "code") value = code;
    if (p.kind === "audit") value = { order, culprit, evidence };
    await act({ type: "solve", value });
    setPending(false);
  }
  const complete =
    p.kind === "budget"
      ? selected.length > 0
      : p.kind === "mapping"
        ? p.fields.every((f) => mapping[f])
        : p.kind === "code"
          ? /^\d{3}$/.test(code)
          : order.length === p.required &&
            (p.kind !== "audit" || (culprit && evidence));
  return (
    <div className="puzzle">
      {p.kind === "circuit" && (
        <div className="role-banner">
          <strong>
            Ronda {p.stage + 1}/2 · Nariz{" "}
            {p.stage === 0 ? "encendida" : "apagada"}
          </strong>
          <span>Operadores: {teams[p.operatorTeam]}</span>
          <span>
            {p.canSubmit
              ? "Vos tenés los controles. Escuchá al otro equipo."
              : "Dictá el manual a los operadores."}
          </span>
        </div>
      )}
      {p.clues.length > 0 && (
        <div className="clues">
          <span className="eyebrow">
            {host
              ? "GUÍA PRIVADA DEL PRESENTADOR"
              : "TUS PISTAS · COMPARTILAS EN VOZ ALTA"}
          </span>
          {p.clues.map((clue, i) => (
            <p key={i}>{clue}</p>
          ))}
        </div>
      )}
      {p.hints.length > 0 && (
        <div className="hints" aria-live="polite">
          {p.hints.map((h, i) => (
            <p key={h}>
              Ayuda {i + 1}: {h}
            </p>
          ))}
        </div>
      )}
      {p.canSubmit && !p.solved && (
        <>
          {["order", "circuit", "audit"].includes(p.kind) && (
            <>
              <div className="answer-slots" aria-label="Secuencia propuesta">
                {Array.from({ length: p.required }, (_, i) => (
                  <span key={i}>
                    <small>{i + 1}</small>
                    {order[i] || "…"}
                  </span>
                ))}
              </div>
              <div className="puzzle-choices">
                {p.choices.map((choice) => (
                  <button
                    key={choice}
                    disabled={
                      !interactive ||
                      order.includes(choice) ||
                      order.length >= p.required
                    }
                    onClick={() => setOrder([...order, choice])}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <button
                className="quiet"
                disabled={!interactive || !order.length}
                onClick={() => setOrder(order.slice(0, -1))}
              >
                Deshacer último paso
              </button>
            </>
          )}
          {p.kind === "budget" && (
            <>
              <p className="budget-total">
                {p.choices
                  .filter((c) => selected.includes(c.id))
                  .reduce((n, c) => n + c.cost, 0)}{" "}
                / 10 fichas
              </p>
              <div className="benefits">
                {p.choices.map((c) => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      disabled={!interactive}
                      checked={selected.includes(c.id)}
                      onChange={() =>
                        setSelected(
                          selected.includes(c.id)
                            ? selected.filter((id) => id !== c.id)
                            : [...selected, c.id],
                        )
                      }
                    />
                    <span>{c.label}</span>
                    <b>{c.cost} fichas</b>
                  </label>
                ))}
              </div>
            </>
          )}
          {p.kind === "mapping" && (
            <div className="mapping">
              {p.fields.map((field) => (
                <label key={field}>
                  {field}
                  <select
                    disabled={!interactive}
                    value={mapping[field] || ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field]: e.target.value })
                    }
                  >
                    <option value="">Elegí un regalo</option>
                    {p.choices.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          {p.kind === "audit" && (
            <div className="mapping">
              <label>
                Culpable
                <select
                  value={culprit}
                  disabled={!interactive}
                  onChange={(e) => setCulprit(e.target.value)}
                >
                  <option value="">Seleccioná</option>
                  {["Santa", "Kevin", "Rodolfo", "Yelba"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Evidencia decisiva
                <select
                  value={evidence}
                  disabled={!interactive}
                  onChange={(e) => setEvidence(e.target.value)}
                >
                  <option value="">Seleccioná</option>
                  {[
                    "Registro de 17 clics",
                    "Rodolfo estaba de goma",
                    "Kevin tiene permisos",
                    "Santa toma café",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {p.kind === "code" && (
            <label>
              Código de restauración
              <input
                className="code-input"
                inputMode="numeric"
                maxLength={3}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="···"
              />
            </label>
          )}
          <button
            className="primary submit-puzzle"
            disabled={!interactive || !complete}
            onClick={send}
          >
            {pending ? "Comprobando…" : "Comprobar solución"}
          </button>
        </>
      )}
      {!p.canSubmit && !p.solved && (
        <p className="muted">
          Las respuestas se envían desde los celulares de los jugadores.
        </p>
      )}
      {p.feedback && (
        <div role="status" className={"result " + (p.solved ? "success" : "")}>
          {p.solved ? "✓ " : ""}
          {p.feedback}
        </div>
      )}
      <div className="puzzle-meta">
        <span>{p.attempts} intentos compartidos</span>
        <span>
          {p.solved
            ? p.assisted
              ? "Resuelto con ayuda"
              : "Resuelto por el equipo"
            : "Sin penalización por intentar"}
        </span>
      </div>
    </div>
  );
}
