import { useEffect, useMemo, useState } from "react";

import type { BackgroundEffect } from "@/lib/themes";

function seeded(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => {
    const r = (n: number) => ((Math.sin(seed + i * 12.9898 + n * 78.233) + 1) / 2);
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      left: round(r(1) * 100),
      delay: round(r(2) * 12),
      duration: round(9 + r(3) * 12),
      size: round(0.5 + r(4) * 1),
      drift: round((r(5) - 0.5) * 24),
      opacity: round(0.35 + r(6) * 0.55),
    };
  });
}

function Petals() {
  const items = useMemo(() => seeded(18, 3), []);
  return (
    <>
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-[50%_0_50%_0] bg-primary/50"
          style={{
            left: `${p.left}%`,
            width: `${Math.round(p.size * 14)}px`,
            height: `${Math.round(p.size * 14)}px`,
            opacity: p.opacity,
            ["--drift" as string]: `${p.drift}vw`,
            animation: `fall-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Stars() {
  const items = useMemo(() => seeded(60, 7), []);
  return (
    <>
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            top: `${Math.round((p.delay / 12) * 100)}%`,
            width: `${Math.round(p.size * 3)}px`,
            height: `${Math.round(p.size * 3)}px`,
            animation: `twinkle ${Math.round((2 + p.size * 3) * 10) / 10}s ease-in-out ${p.delay / 2}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Haze() {
  return (
    <>
      <span
        className="absolute -left-1/4 top-0 h-[70vh] w-[80vw] rounded-full bg-accent/40 blur-3xl"
        style={{ animation: "haze-shift 18s ease-in-out infinite" }}
      />
      <span
        className="absolute -right-1/4 bottom-0 h-[60vh] w-[70vw] rounded-full bg-primary/25 blur-3xl"
        style={{ animation: "haze-shift 24s ease-in-out 3s infinite reverse" }}
      />
      {seeded(10, 11).map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 block text-primary/60"
          style={{
            left: `${p.left}%`,
            fontSize: `${Math.round(p.size * 18)}px`,
            ["--drift" as string]: `${p.drift}vw`,
            animation: `rise-float ${p.duration + 6}s linear ${p.delay}s infinite`,
          }}
        >
          ♥
        </span>
      ))}
    </>
  );
}

function Confetti() {
  const items = useMemo(() => seeded(22, 17), []);
  return (
    <>
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block text-primary/70"
          style={{
            left: `${p.left}%`,
            fontSize: `${Math.round(p.size * 14)}px`,
            opacity: p.opacity,
            ["--drift" as string]: `${p.drift}vw`,
            animation: `fall-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          ♥
        </span>
      ))}
    </>
  );
}

export function ThemeBackground({ effect }: { effect: BackgroundEffect }) {
  // Decorative only: render after hydration so the randomized inline styles
  // never have to match server output.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      data-bg-effect={effect}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {effect === "petals" && <Petals />}
      {effect === "stars" && <Stars />}
      {effect === "haze" && <Haze />}
      {effect === "confetti" && <Confetti />}
    </div>
  );
}
