export type ThemeId = "rose" | "starlit" | "sunset" | "vintage";

export type BackgroundEffect = "petals" | "stars" | "haze" | "confetti";

export interface ProposalTheme {
  id: ThemeId;
  label: string;
  tagline: string;
  swatch: [string, string, string];
  effect: BackgroundEffect;
}

export const themes: ProposalTheme[] = [
  {
    id: "rose",
    label: "Rose Garden",
    tagline: "Blush petals and deep rose",
    swatch: ["#f6dbe4", "#e98aa6", "#b03a5b"],
    effect: "petals",
  },
  {
    id: "starlit",
    label: "Starlit Night",
    tagline: "Midnight blue and gold",
    swatch: ["#1b2145", "#3b3f7a", "#e3bb63"],
    effect: "stars",
  },
  {
    id: "sunset",
    label: "Sunset Dream",
    tagline: "Peach, coral and amber",
    swatch: ["#ffe2c2", "#ffb185", "#e0693f"],
    effect: "haze",
  },
  {
    id: "vintage",
    label: "Vintage Love",
    tagline: "Cream, mauve and gold",
    swatch: ["#f3ead6", "#d8c49a", "#8d5f72"],
    effect: "confetti",
  },
];

export const defaultTheme: ThemeId = "rose";

export function isThemeId(value: unknown): value is ThemeId {
  return themes.some((t) => t.id === value);
}

export function getTheme(id: ThemeId): ProposalTheme {
  return themes.find((t) => t.id === id) ?? (themes[0] as ProposalTheme);
}
