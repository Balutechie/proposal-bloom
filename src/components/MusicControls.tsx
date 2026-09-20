import { Music, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AmbientPlayer, tracks, type TrackId } from "@/lib/music";

interface Props {
  defaultTrack?: TrackId;
  /** When set, the visitor can switch tracks (creator preview). */
  allowTrackChange?: boolean;
  onTrackChange?: (id: TrackId) => void;
}

export function MusicControls({
  defaultTrack = "musicbox",
  allowTrackChange = false,
  onTrackChange,
}: Props) {
  const playerRef = useRef<AmbientPlayer | null>(null);
  const [track, setTrack] = useState<TrackId>(defaultTrack);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => setTrack(defaultTrack), [defaultTrack]);

  useEffect(() => {
    return () => playerRef.current?.dispose();
  }, []);

  const player = () => {
    if (!playerRef.current) playerRef.current = new AmbientPlayer();
    return playerRef.current;
  };

  const toggle = async () => {
    if (playing) {
      player().stop();
      setPlaying(false);
      return;
    }
    if (track === "none") return;
    await player().play(track);
    setPlaying(true);
  };

  const pick = async (id: TrackId) => {
    setTrack(id);
    onTrackChange?.(id);
    if (id === "none") {
      player().stop();
      setPlaying(false);
      return;
    }
    await player().play(id);
    setPlaying(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="w-56 rounded-2xl border border-border bg-card/95 p-3 text-left shadow-lg backdrop-blur">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Background music
          </p>
          <div className="flex flex-col gap-1">
            {tracks
              .filter((t) => allowTrackChange || t.id === track || t.id === "none")
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => void pick(t.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    t.id === track
                      ? "bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="block">{t.label}</span>
                  <span className="block text-xs opacity-70">{t.description}</span>
                </button>
              ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="h-4 w-4" aria-hidden />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                player().setVolume(v);
              }}
              className="w-full accent-[var(--primary)]"
              aria-label="Music volume"
            />
          </label>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Music options"
          className="rounded-full border border-border bg-card/90 p-3 text-card-foreground shadow-md backdrop-blur transition-colors hover:bg-secondary"
        >
          <Music className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? "Pause music" : "Play music"}
          className="rounded-full bg-primary p-3 text-primary-foreground shadow-[0_0_20px_var(--glow)] transition-transform hover:scale-105"
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
