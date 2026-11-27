import React, { useState } from "react";
export default function Puzzle({ puzzle: p, act, connected = true, sceneId, now }) {
  const [selected, setSelected] = useState(""),
    [pending, setPending] = useState(false),
    [feedback, setFeedback] = useState("");
  const retry = Math.max(0, Math.ceil((p.retryAt - now) / 1000));
  async function send() {
    setPending(true);
    const r = await act({
      type: "solve",
      scene: sceneId,
      value: selected,
    });
    if (r?.ok)
      setFeedback(
        r.correct
          ? "¡Correcto! +100 puntos."
          : "Respuesta incorrecta. Revisá las pistas e intentá de nuevo.",
      );
    setPending(false);
  }
  return (
    <div className="puzzle">
      <div className="clues">
        <span className="eyebrow">
          EXPEDIENTE INDIVIDUAL · MISMAS PISTAS PARA TODOS
        </span>
        {p.clues.map((c) => (
          <p key={c}>{c}</p>
        ))}
      </div>
      {p.hints.length > 0 && (
        <div className="hints">
          {p.hints.map((h) => (
            <p key={h}>{h}</p>
          ))}
        </div>
      )}
      <div className="options">
        {p.choices.map((c) => (
          <button
            key={c.id}
            aria-pressed={selected === c.id}
            className={
              (selected === c.id ? "selected " : "") +
              (p.closed && p.correct === c.id ? "correct-answer" : "")
            }
            disabled={!p.canSubmit || !connected || pending || retry > 0}
            onClick={() => setSelected(c.id)}
          >
            <span className="option-letter">{c.id}</span>
            <span>{c.label}</span>
            {p.closed && p.correct === c.id && <b>✓ Correcta</b>}
          </button>
        ))}
      </div>
      {p.canSubmit && (
        <button
          className="primary submit-puzzle"
          disabled={!selected || pending || !connected || retry > 0}
          onClick={send}
        >
          {pending
            ? "Comprobando…"
            : retry
              ? `Podés reintentar en ${retry}s`
              : "Enviar mi respuesta"}
        </button>
      )}
      <div role="status">
        {(p.feedback || feedback) && (
          <div className={"result " + (p.solved ? "success" : "")}>
            {p.feedback || feedback}
          </div>
        )}
      </div>
      <p className="muted">
        {p.attempts} intentos tuyos · Una recompensa por capítulo.
      </p>
    </div>
  );
}
