// Sounds for the visual timer, made with the Web Audio API so no sound files are needed.
// Browsers only allow audio after a tap, so unlockTimerAudio() runs when the timer is started.

let context = null;

function audioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) context = new AudioContextClass();
  return context;
}

export function unlockTimerAudio() {
  const ctx = audioContext();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

// A soft bell: a sine tone with a quieter overtone that fades out.
function bell(ctx, frequency, start, length = 1.6, volume = 0.22) {
  [[1, volume], [2.76, volume * 0.18]].forEach(([ratio, gainValue]) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + length + 0.05);
  });
}

const SOUNDS = {
  // Three gentle rising tones, twice.
  chime: (ctx, now) => {
    [0, 1.5].forEach((offset) => {
      [523.25, 659.25, 783.99].forEach((note, index) => bell(ctx, note, now + offset + index * 0.28));
    });
  },
  // A short, cheerful xylophone tune.
  melody: (ctx, now) => {
    [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((note, index) => {
      bell(ctx, note, now + index * 0.22, index === 6 ? 1.4 : 0.5, 0.2);
    });
  },
  // One soft, low bell, like a meditation bowl.
  bowl: (ctx, now) => {
    bell(ctx, 392, now, 3.2, 0.26);
    bell(ctx, 392, now + 2.2, 3.2, 0.2);
  },
};

export const TIMER_SOUND_IDS = ["chime", "melody", "bowl", "silent"];

export function playTimerSound(id) {
  const play = SOUNDS[id];
  const ctx = play && audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  play(ctx, ctx.currentTime + 0.05);
}
