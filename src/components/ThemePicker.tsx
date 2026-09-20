import { themes, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose a mood"
      className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card/70 p-2 backdrop-blur-md sm:gap-3"
    >
      {themes.map((theme) => {
        const active = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={theme.tagline}
            onClick={() => onChange(theme.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all sm:text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-[0_0_24px_var(--glow)]"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            <span className="flex -space-x-1">
              {theme.swatch.map((c) => (
                <span
                  key={c}
                  className="h-3.5 w-3.5 rounded-full border border-card"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
            <span className="hidden sm:inline">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
