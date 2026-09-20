export type TrackId = "none" | "musicbox" | "strings" | "dreamy";

export interface Track {
  id: TrackId;
  label: string;
  description: string;
}

export const tracks: Track[] = [
  { id: "none", label: "Silence", description: "No background music" },
  { id: "musicbox", label: "Music Box", description: "Soft twinkling lullaby" },
  { id: "strings", label: "Slow Strings", description: "Warm, cinematic swell" },
  { id: "dreamy", label: "Dreamy Waves", description: "Floating ambient pads" },
];

export function isTrackId(value: unknown): value is TrackId {
  return tracks.some((t) => t.id === value);
}

interface Voice {
  type: OscillatorType;
  notes: number[];
  step: number;
  attack: number;
  release: number;
  gain: number;
  detune?: number;
}

const n = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);

const VOICES: Record<Exclude<TrackId, "none">, Voice> = {
  musicbox: {
    type: "triangle",
    // C major pentatonic arpeggio
    notes: [n(3), n(7), n(10), n(15), n(10), n(7), n(3), n(-2)],
    step: 0.55,
    attack: 0.01,
    release: 0.9,
    gain: 0.18,
  },
  strings: {
    type: "sawtooth",
    notes: [n(-9), n(-5), n(-2), n(-4)],
    step: 3.2,
    attack: 1.2,
    release: 2.4,
    gain: 0.09,
    detune: 6,
  },
  dreamy: {
    type: "sine",
    notes: [n(-12), n(-5), n(0), n(4), n(-5)],
    step: 2.2,
    attack: 0.9,
    release: 1.8,
    gain: 0.14,
    detune: 4,
  },
};

/**
 * Tiny generative ambient player built on the Web Audio API — no audio files to
 * download, so it starts instantly and behaves the same on mobile and desktop.
 * Must be started from a user gesture (browser autoplay rules).
 */
export class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private index = 0;
  private track: Exclude<TrackId, "none"> = "musicbox";
  private volume = 0.7;

  async play(track: TrackId) {
    this.stop();
    if (track === "none") return;
    this.track = track;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const ctx = this.ctx && this.ctx.state !== "closed" ? this.ctx : new Ctor();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = this.volume;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    master.connect(filter).connect(ctx.destination);
    this.master = master;

    const voice = VOICES[this.track];
    this.index = 0;
    const tick = () => this.playNote(voice);
    tick();
    this.timer = setInterval(tick, voice.step * 1000);
  }

  private playNote(voice: Voice) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const freq = voice.notes[this.index % voice.notes.length] as number;
    this.index += 1;

    const now = ctx.currentTime;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(voice.gain, now + voice.attack);
    env.gain.exponentialRampToValueAtTime(
      0.0001,
      now + voice.attack + voice.release,
    );
    env.connect(master);

    const make = (detune: number) => {
      const osc = ctx.createOscillator();
      osc.type = voice.type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(env);
      osc.start(now);
      osc.stop(now + voice.attack + voice.release + 0.1);
    };
    make(0);
    if (voice.detune) {
      make(voice.detune);
      make(-voice.detune);
    }
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    }
    this.master = null;
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}
