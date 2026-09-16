// Web Audio API Sound Generator for Horizon Auto PC
// 100% self-contained synthesized sounds - zero external audio files needed

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

export const setSoundMuted = (muted: boolean) => {
  isMuted = muted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("horizon_pc_muted", muted ? "true" : "false");
    } catch {
      // ignore
    }
  }
};

export const getSoundMuted = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("horizon_pc_muted");
      if (stored !== null) {
        isMuted = stored === "true";
      }
    } catch {
      // ignore
    }
  }
  return isMuted;
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }
  }
  try {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch {
    // ignore
  }
  return audioCtx;
};

/**
 * Play a light mechanical click (for buttons & chip selections)
 */
export const playClickSound = () => {
  if (getSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // ignore
  }
};

/**
 * Play slot cycling tick (during randomized reel spin)
 */
export const playReelTickSound = (pitch = 440) => {
  if (getSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // ignore
  }
};

/**
 * Play component reveal chord
 */
export const playRevealSound = (rarity: string) => {
  if (getSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const baseFreq = rarity === "Mythic" ? 659.25 : rarity === "Legendary" ? 587.33 : rarity === "Epic" ? 523.25 : 440;
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = rarity === "Mythic" || rarity === "Legendary" ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.35);
    });
  } catch {
    // ignore
  }
};

/**
 * Play celebratory jackpot sound for God Builds & Mythic luck
 */
export const playJackpotSound = () => {
  if (getSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  } catch {
    // ignore
  }
};
