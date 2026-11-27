import React from "react";
function Grinch() {
  return (
    <svg viewBox="0 0 100 70" role="img" aria-label="Adorno del Grinch">
      <path
        d="M15 25Q20 3 50 9 80 3 85 25L95 22 87 41Q77 64 50 66 22 64 13 41L5 22Z"
        fill="#9fdb4b"
      />
      <path
        d="M21 23l20 8m38-8-20 8"
        stroke="#25492c"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M24 32q7-7 16 3-12 10-16-3m52 0q-7-7-16 3 12 10 16-3"
        fill="#ffe487"
      />
      <circle cx="34" cy="34" r="3" fill="#211a38" />
      <circle cx="66" cy="34" r="3" fill="#211a38" />
      <path
        d="M45 43q5 5 10 0M25 46q25 25 50-4"
        fill="none"
        stroke="#25492c"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
export default function RankingTree({ ranking }) {
  return (
    <section className="ranking-finale">
      <h2>El árbol de los que salvaron la Navidad</h2>
      <p className="muted">
        Más puntos, más arriba. En empate: menor tiempo acumulado en aciertos;
        después, orden de ingreso.
      </p>
      <div className="ranking-tree">
        <div className="ranking-star">★</div>
        <ol>
          {ranking.map((p, i) => (
            <li
              key={p.id}
              style={{
                "--sway": `${(i % 2 === 0 ? -1 : 1) * Math.min(i * 7, 80)}px`,
              }}
            >
              <div className={"ornament " + (p.isGrinch ? "grinch" : "")}>
                <span className="ornament-cap" />
                {p.isGrinch && <Grinch />}
                <span className="ornament-rank">#{p.rank}</span>
                <strong>{p.name}</strong>
                <span>{p.score} puntos</span>
                {p.isGrinch && <small>Grinch de la noche</small>}
              </div>
            </li>
          ))}
        </ol>
        <div className="tree-trunk" />
      </div>
      <details className="score-details">
        <summary>Ver tabla de puntos</summary>
        <table className="score-table">
          <thead>
            <tr>
              <th>Puesto</th>
              <th>Apodo</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p) => (
              <tr key={p.id}>
                <td>{p.rank}</td>
                <td>
                  {p.name}
                  {p.isGrinch ? " · Grinch" : ""}
                </td>
                <td>{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
