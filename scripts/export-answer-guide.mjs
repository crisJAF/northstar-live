import { mkdirSync, writeFileSync } from "node:fs";
import { scenes } from "../shared/story.js";
import { puzzles } from "../server/puzzles.js";
mkdirSync("tmp/pdfs", { recursive: true });
const questions = scenes
  .filter((s) => ["puzzle", "charge"].includes(s.type))
  .map((s) => ({
    id: s.id,
    title: s.title,
    tag: s.tag,
    prompt: s.text,
    ...(s.type === "puzzle"
      ? puzzles[s.id]
      : {
          clues: [
            "La batería se carga manteniendo el botón presionado.",
            "Al llegar al 50 %, el sistema pide soltar.",
            "Hay que permanecer un segundo sin presionar.",
            "Después se vuelve a mantener hasta el 100 %.",
          ],
          choices: [
            { id: "A", label: "Mantener sin soltar hasta el 100 %." },
            {
              id: "B",
              label:
                "Mantener hasta el 50 %, soltar durante un segundo y volver a mantener hasta el 100 %.",
            },
            { id: "C", label: "Pulsar rápidamente muchas veces sin mantener." },
            {
              id: "D",
              label: "Soltar al 25 % y esperar que el sistema termine solo.",
            },
          ],
          correct: "B",
          hints: [
            "Es un reto de acción individual: estas alternativas describen la solución para el presentador; no son botones de respuesta dentro del juego.",
          ],
          success:
            "Completar la carga antes de que se llene el cupo otorga 100 puntos.",
        }),
  }));
writeFileSync(
  "tmp/pdfs/answer-guide.json",
  JSON.stringify(
    {
      questions,
      story: scenes.filter((s) =>
        ["proposal", "ballot", "vote", "ready"].includes(s.type),
      ),
    },
    null,
    2,
  ),
);
