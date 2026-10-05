import confetti from "canvas-confetti";

const EMOJIS = ["🎉", "✨", "🔥", "💅", "🥂", "💥"];
const COLORES = ["#0284c7", "#f97316", "#14b8a6", "#eab308", "#ec4899", "#ffffff"];

const comun = { disableForReducedMotion: true, zIndex: 100 } as const;

function formasEmoji(emojis: string[], scalar: number) {
  return emojis.map((text) => confetti.shapeFromText({ text, scalar }));
}

/** Panel resuelto: dos cañones de confeti desde los lados y una lluvia de emojis desde el centro. */
export function celebrarPanel(): void {
  const lado = { ...comun, particleCount: 90, spread: 70, startVelocity: 60, colors: COLORES };
  void confetti({ ...lado, angle: 60, origin: { x: 0, y: 0.8 } });
  void confetti({ ...lado, angle: 120, origin: { x: 1, y: 0.8 } });
  const scalar = 3;
  void confetti({
    ...comun,
    shapes: formasEmoji(EMOJIS, scalar),
    scalar,
    particleCount: 24,
    spread: 100,
    startVelocity: 45,
    gravity: 0.8,
    ticks: 220,
    origin: { x: 0.5, y: 0.55 },
  });
}

/** Misión completada: unos segundos de fuegos artificiales con emojis. */
export function celebrarMision(): void {
  const fin = Date.now() + 3500;
  const scalar = 3.5;
  const emojis = formasEmoji(["🏆", "🥂", "✨", "🎉", "💅"], scalar);
  const rafaga = () => {
    const x = 0.15 + Math.random() * 0.7;
    void confetti({ ...comun, particleCount: 60, spread: 360, startVelocity: 35, ticks: 120, colors: COLORES, origin: { x, y: 0.2 + Math.random() * 0.3 } });
    void confetti({ ...comun, shapes: emojis, scalar, particleCount: 6, spread: 360, startVelocity: 25, ticks: 160, origin: { x, y: 0.3 } });
    if (Date.now() < fin) setTimeout(rafaga, 450);
  };
  rafaga();
}
