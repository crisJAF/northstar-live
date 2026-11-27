// Authoritative answer bank. Never imported by the browser.
export const puzzles = {
  access: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label: "Reno, Regalo, Estrella, Copo, Campana, Bastón",
      },
      {
        id: "B",
        label: "Reno, Regalo, Copo, Estrella, Campana, Bastón",
      },
      {
        id: "C",
        label: "Bastón, Regalo, Copo, Estrella, Campana, Reno",
      },
      {
        id: "D",
        label: "Reno, Copo, Regalo, Campana, Estrella, Bastón",
      },
    ],
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
    seal: {
      name: "Acceso",
      digit: "4",
    },
    correct: "B",
  },
  circuits: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label:
          "Encendida: Copo, Estrella, Campana. Apagada: Regalo, Campana, Copo.",
      },
      {
        id: "B",
        label:
          "Encendida: Estrella, Copo, Campana. Apagada: Regalo, Copo, Campana.",
      },
      {
        id: "C",
        label:
          "Encendida: Copo, Regalo, Estrella. Apagada: Campana, Regalo, Copo.",
      },
      {
        id: "D",
        label:
          "Encendida: Regalo, Campana, Copo. Apagada: Copo, Estrella, Campana.",
      },
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
    correct: "A",
  },
  budget: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label: "Aguinaldo (5) + descanso (3) + pizza (2)",
      },
      {
        id: "B",
        label: "Bus (2) + karaoke (4) + descanso (3)",
      },
      {
        id: "C",
        label: "Aguinaldo (5) + descanso (3) + bus (2)",
      },
      {
        id: "D",
        label: "Aguinaldo (5) + bus (2) + karaoke (4)",
      },
    ],
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
    correct: "C",
  },
  gifts: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label:
          "Managua: Libro; León: Parlante; Masaya: Bicicleta; Granada: Bufanda",
      },
      {
        id: "B",
        label:
          "Managua: Bicicleta; León: Libro; Masaya: Parlante; Granada: Bufanda",
      },
      {
        id: "C",
        label:
          "Managua: Bicicleta; León: Parlante; Masaya: Bufanda; Granada: Libro",
      },
      {
        id: "D",
        label:
          "Managua: Bicicleta; León: Parlante; Masaya: Libro; Granada: Bufanda",
      },
    ],
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
    seal: {
      name: "Producción",
      digit: "2",
    },
    correct: "D",
  },
  sequence: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label: "Luces, Palanca, Campanas, Encendido",
      },
      {
        id: "B",
        label: "Luces, Campanas, Palanca, Encendido",
      },
      {
        id: "C",
        label: "Campanas, Luces, Palanca, Encendido",
      },
      {
        id: "D",
        label: "Encendido, Luces, Campanas, Palanca",
      },
    ],
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
    correct: "B",
  },
  audit: {
    kind: "choice",
    choices: [
      {
        id: "A",
        label:
          "Compra, respaldo, clics, excusa. Culpable: Kevin. Prueba: sus permisos.",
      },
      {
        id: "B",
        label:
          "Respaldo, compra, excusa, clics. Culpable: Santa. Prueba: la tarjeta.",
      },
      {
        id: "C",
        label:
          "Respaldo, compra, clics, excusa. Culpable: Santa. Prueba: registro de 17 clics.",
      },
      {
        id: "D",
        label:
          "Respaldo, compra, clics, excusa. Culpable: Rodolfo. Prueba: estaba de goma.",
      },
    ],
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
    correct: "C",
  },
  reboot: {
    kind: "choice",
    clues: [
      "El primer dígito viene del sello de Acceso.",
      "El segundo viene del sello de Producción.",
      "El tercero viene del sello de Vuelo.",
      "Los sellos están visibles en la pantalla grande.",
      "No hay que sumar los dígitos.",
      "El código tiene tres cifras.",
      "El orden es Acceso, Producción y Vuelo.",
    ],
    hints: [
      "Miren los tres sellos recuperados.",
      "Acceso 4, Producción 2, Vuelo 7.",
      "El código es 427.",
    ],
    success: "Respaldo restaurado. Ya pueden encender sus luces.",
    choices: [
      {
        id: "A",
        label: "427",
      },
      {
        id: "B",
        label: "472",
      },
      {
        id: "C",
        label: "247",
      },
      {
        id: "D",
        label: "724",
      },
    ],
    correct: "A",
  },
};
export function puzzleView(id, round, player, closed) {
  const p = puzzles[id];
  const solved = round.winners.some((w) => w.id === player?.id);
  return {
    kind: "choice",
    choices: p.choices,
    clues: p.clues,
    hints: p.hints.slice(0, round.hint),
    hint: round.hint,
    canSubmit: !!player && !closed && !solved,
    solved,
    closed,
    attempts: round.attempts[player?.id] || 0,
    retryAt: round.cooldowns[player?.id] || 0,
    revision: round.attempts[player?.id] || 0,
    feedback: solved
      ? "¡Correcto! Ganaste 100 puntos."
      : closed
        ? "Cupo cerrado. La próxima misión es otra oportunidad."
        : "",
    correct: closed ? p.correct : undefined,
  };
}
