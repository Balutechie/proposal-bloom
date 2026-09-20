import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { ThemeBackground } from "@/components/ThemeBackground";
import { ThemePicker } from "@/components/ThemePicker";
import { defaultTheme, getTheme, isThemeId, type ThemeId } from "@/lib/themes";

export const Route = createFileRoute("/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { theme?: ThemeId | undefined; to?: string | undefined } => ({
    theme: isThemeId(search["theme"]) ? search["theme"] : undefined,
    to: typeof search["to"] === "string" ? (search["to"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Will You Be Mine? — An Interactive Proposal" },
      {
        name: "description",
        content:
          "Send a playful, personal love proposal with drifting petals, starlight and a No button that refuses to be caught.",
      },
      { property: "og:title", content: "Will You Be Mine? — An Interactive Proposal" },
      {
        property: "og:description",
        content:
          "Pick a romantic mood, personalize the message, and share a proposal page they'll never forget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NO_LINES = [
  "No",
  "Are you sure?",
  "Really sure??",
  "Think again!",
  "Last chance...",
  "Surely not?",
  "You might regret this!",
  "Give it another thought!",
  "Are you absolutely certain?",
  "This could be a mistake!",
];

function Index() {
  const search = Route.useSearch();
  const themeId: ThemeId = search.theme ?? defaultTheme;
  const to = search.to;
  const navigate = useNavigate({ from: "/" });
  const theme = getTheme(themeId);

  const [noCount, setNoCount] = useState(0);
  const [yes, setYes] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  const setTheme = (id: ThemeId) => {
    navigate({ search: (prev) => ({ ...prev, theme: id }), replace: true });
  };

  const dodge = () => {
    const box = areaRef.current?.getBoundingClientRect();
    const range = box ? Math.min(box.width, 320) / 2 : 120;
    setOffset({
      x: (Math.random() - 0.5) * range * 2,
      y: (Math.random() - 0.5) * 120,
    });
    setNoCount((c) => Math.min(c + 1, NO_LINES.length - 1));
  };

  const yesScale = 1 + noCount * 0.14;
  const name = to?.trim();

  return (
    <div className="relative min-h-screen">
      <ThemeBackground effect={theme.effect} />

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-5 py-14 text-center sm:gap-10 sm:py-20">
        {yes ? (
          <section className="flex flex-col items-center gap-6">
            <span className="text-7xl sm:text-8xl animate-heart-beat">💖</span>
            <h1 className="text-4xl leading-tight text-foreground sm:text-6xl">
              {name ? `${name} said yes!` : "She said yes!"}
            </h1>
            <p className="max-w-md text-base text-muted-foreground sm:text-lg">
              Somewhere a thousand petals just fell at once. Let's make this the
              first page of a very long story.
            </p>
            <button
              type="button"
              onClick={() => {
                setYes(false);
                setNoCount(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              Replay the moment
            </button>
          </section>
        ) : (
          <section className="flex w-full flex-col items-center gap-7">
            <span className="text-6xl sm:text-7xl animate-heart-beat">💌</span>
            <h1 className="text-4xl leading-[1.1] text-foreground sm:text-6xl">
              {name ? `${name}, will you be mine?` : "Will you be mine?"}
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              I had a whole speech prepared, but it came out as one small
              question and one very stubborn button.
            </p>

            <div
              ref={areaRef}
              className="relative flex h-44 w-full items-center justify-center gap-4 sm:h-36"
            >
              <button
                type="button"
                onClick={() => setYes(true)}
                style={{ transform: `scale(${yesScale})` }}
                className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-[0_0_36px_var(--glow)] transition-transform duration-300 hover:brightness-110 sm:text-lg"
              >
                Yes 💍
              </button>
              <button
                type="button"
                onClick={dodge}
                onMouseEnter={dodge}
                onFocus={dodge}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
                className="rounded-full border border-border bg-card px-6 py-3 text-sm text-card-foreground transition-transform duration-200 sm:text-base"
              >
                {NO_LINES[noCount]}
              </button>
            </div>
          </section>
        )}

        <footer className="mt-4 flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Choose your mood
          </p>
          <ThemePicker value={themeId} onChange={setTheme} />
          <p className="text-xs text-muted-foreground">{theme.tagline}</p>
        </footer>
      </main>
    </div>
  );
}
