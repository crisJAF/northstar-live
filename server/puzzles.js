// Private solutions: this module is never imported by the browser.
import { symbols, benefits, gifts, cities, events } from "../shared/story.js";
export const puzzles = {
  access: {
    kind: "order",
    choices: symbols,
    answer: ["Reno", "Regalo", "Copo", "Estrella", "Campana", "Bastón"],
    clues: [
      "El reno va primero.",
      "El regalo va inmediatamente después del reno.",
      "El copo ocupa la tercera posición.",
      "La estrella va inmediatamente antes de la campana.",
      "El bastón va al final.",
      "La campana no ocupa la tercera posición.",
      "Cada símbolo se usa exactamente una vez.",
    ],
    hints: [
      "Fijen los extremos antes de ordenar el centro.",
      "Los tres primeros son Reno, Regalo y Copo.",
      "Después van Estrella, Campana y Bastón.",
    ],
    success:
      "Acceso recuperado. El sistema confundió la barba de Santa con una alfombra.",
    seal: { name: "Acceso", digit: "4" },
  },
  circuits: {
    kind: "circuit",
    choices: ["Copo", "Estrella", "Regalo", "Campana"],
    answers: [
      ["Copo", "Estrella", "Campana"],
      ["Regalo", "Campana", "Copo"],
    ],
    clues: [
      "Con la nariz encendida, la primera tecla es Copo.",
      "Con la nariz encendida, Estrella va inmediatamente después de Copo.",
      "Con la nariz encendida, la última tecla es Campana.",
      "Con la nariz apagada, la primera tecla es Regalo.",
      "Con la nariz apagada, Campana va inmediatamente después de Regalo.",
      "Con la nariz apagada, la última tecla es Copo.",
      "Se presionan tres teclas distintas. La nariz cambia al pasar de ronda.",
    ],
    hints: [
      "La nariz encendida usa Copo; apagada usa Regalo para comenzar.",
      "Ronda 1: Copo, Estrella, Campana.",
      "Ronda 2: Regalo, Campana, Copo.",
    ],
    success: "Circuitos activos. Kevin quedó envuelto en dos metros de cinta.",
  },
  budget: {
    kind: "budget",
    choices: benefits,
    answer: ["pay", "rest", "bus"],
    clues: [
      "El sindicato exige un beneficio de pago.",
      "Pizza no cuenta como pago.",
      "El descanso del 26 es obligatorio.",
      "El transporte debe cubrir el regreso.",
      "El presupuesto máximo es diez fichas.",
      "Karaoke no sustituye descanso ni transporte.",
      "No hace falta comprar todos los beneficios.",
    ],
    hints: [
      "Hay tres condiciones: pago, descanso y transporte.",
      "Los beneficios obligatorios cuestan 5, 3 y 2.",
      "Seleccionen aguinaldo, descanso y bus.",
    ],
    success: "Presupuesto aprobado. La pizza ya no aparece en la nómina.",
  },
  gifts: {
    kind: "mapping",
    choices: gifts,
    fields: cities,
    answer: ["Bicicleta", "Parlante", "Libro", "Bufanda"],
    clues: [
      "La bicicleta va a Managua.",
      "El parlante va a León.",
      "A Masaya no va ropa.",
      "La bufanda es el único regalo de ropa.",
      "El libro no va a Granada.",
      "Cada ciudad recibe un regalo distinto.",
      "A Granada no va nada electrónico.",
    ],
    hints: [
      "Empiecen con las asignaciones directas: bicicleta y parlante.",
      "Quedan libro y bufanda para Masaya y Granada.",
      "Masaya recibe el libro; Granada recibe la bufanda.",
    ],
    success:
      "Regalos clasificados. La abuelita de León ya está probando el parlante.",
    seal: { name: "Producción", digit: "2" },
  },
  sequence: {
    kind: "order",
    choices: ["Palanca", "Encendido", "Luces", "Campanas"],
    answer: ["Luces", "Campanas", "Palanca", "Encendido"],
    clues: [
      "Las luces son el primer paso.",
      "Las campanas van inmediatamente después de las luces.",
      "La palanca se activa después de las campanas.",
      "Encendido es el último paso.",
      "No se puede activar la palanca antes de las luces.",
      "Cada control se activa una sola vez.",
      "Las campanas confirman que el circuito tiene energía.",
    ],
    hints: [
      "Primero hay que ver: luces.",
      "Después de luces vienen campanas.",
      "Luces, Campanas, Palanca, Encendido.",
    ],
    success:
      "Secuencia reconstruida. Rodolfo promete recordarla… hasta mañana.",
  },
  audit: {
    kind: "audit",
    choices: events,
    answer: [events[1], events[0], events[2], events[3]],
    clues: [
      "23:30 — Kevin guardó un respaldo y cerró sesión.",
      "23:40 — Se compró NavidadOS con la tarjeta de Santa.",
      "23:43 — La cuenta Santa hizo 17 clics en Optimizar.",
      "23:44 — Santa escribió “eso ya estaba así”.",
      "Rodolfo no tiene acceso al sistema de producción.",
      "La compra ocurrió después del respaldo.",
      "El registro de clics identifica la cuenta que ejecutó la actualización.",
    ],
    hints: [
      "El respaldo ocurrió antes de comprar la actualización.",
      "Respaldo, compra, clics y excusa.",
      "Culpable: Santa. Evidencia: registro de 17 clics.",
    ],
    success:
      "Caso cerrado. Santa busca cómo borrar historial de administrador.",
  },
  reboot: {
    kind: "code",
    clues: [
      "El primer dígito viene del sello de Acceso.",
      "El segundo viene del sello de Producción.",
      "El tercero viene del sello de Vuelo.",
      "Los sellos están visibles en la pantalla grande.",
      "No hay que sumar los dígitos.",
      "El código tiene tres cifras.",
      "El orden es Acceso, Producción y Vuelo.",
    ],
    answer: "427",
    hints: [
      "Miren los tres sellos recuperados.",
      "Acceso 4, Producción 2, Vuelo 7.",
      "El código es 427.",
    ],
    success: "Respaldo restaurado. Ya pueden encender sus luces.",
  },
};
export function newPuzzle() {
  return {
    stage: 0,
    attempts: 0,
    hint: 0,
    solved: false,
    assisted: false,
    feedback: "",
    revision: 0,
  };
}
export function solve(id, state, value) {
  const p = puzzles[id];
  if (!p || state.solved) throw Error("Este puzzle no acepta respuestas.");
  state.attempts++;
  let correct = false;
  if (p.kind === "budget")
    correct =
      Array.isArray(value) &&
      value.length === 3 &&
      new Set(value).size === 3 &&
      p.answer.every((x) => value.includes(x));
  else if (p.kind === "audit")
    correct =
      !!value &&
      JSON.stringify(value.order) === JSON.stringify(p.answer) &&
      value.culprit === "Santa" &&
      value.evidence === "Registro de 17 clics";
  else
    correct =
      JSON.stringify(value) ===
      JSON.stringify(p.kind === "circuit" ? p.answers[state.stage] : p.answer);
  state.revision++;
  if (!correct) {
    state.feedback =
      "Algo no cuadra. Comparen las pistas; el Polo Norte no cobra por otro intento.";
    return false;
  }
  if (p.kind === "circuit" && state.stage === 0) {
    state.stage = 1;
    state.feedback =
      "Primer circuito listo. ¡Intercambien operadores y técnicos!";
    return true;
  }
  state.solved = true;
  state.feedback = p.success;
  return true;
}
export function puzzleView(id, state, player, players, host) {
  const p = puzzles[id];
  if (!p) return null;
  const operatorTeam = state.stage % 2;
  let clues = [];
  if (host) clues = p.clues;
  else if (player) {
    if (p.kind === "circuit") {
      if (player.team !== operatorTeam) clues = p.clues;
    } else {
      const pairs = Math.max(1, Math.ceil(players.length / 2));
      clues = p.clues.filter((_, i) => i % pairs === player.pair);
    }
  }
  return {
    ...state,
    kind: p.kind,
    choices: p.choices,
    fields: p.fields,
    clues,
    hints: p.hints.slice(0, state.hint),
    canSubmit:
      !!player && (p.kind !== "circuit" || player.team === operatorTeam),
    operatorTeam,
    required:
      p.kind === "circuit"
        ? 3
        : p.kind === "order" || p.kind === "audit"
          ? p.answer.length
          : undefined,
  };
}
