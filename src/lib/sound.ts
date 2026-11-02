/**
 * Optional interface sound — off by default, enabled only by an explicit
 * click on the Sound toggle. Everything is synthesised with WebAudio, so
 * there are no audio files to download.
 *
 * - Ambient bed: very quiet filtered noise with a slow projector flutter.
 * - Tick: a short, soft mechanical click for primary actions.
 */

type Listener = (on: boolean) => void;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { src: AudioBufferSourceNode; gain: GainNode; lfo: OscillatorNode } | null = null;
let enabled = false;
const listeners = new Set<Listener>();

function noiseBuffer(context: AudioContext, seconds: number, brown = true) {
  const len = Math.floor(context.sampleRate * seconds);
  const buf = context.createBuffer(1, len, context.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buf;
}

function startAmbient(context: AudioContext, out: AudioNode) {
  const src = context.createBufferSource();
  src.buffer = noiseBuffer(context, 6);
  src.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;

  const gain = context.createGain();
  gain.gain.value = 0;

  // Projector-like flutter: subtle amplitude modulation at 24 Hz
  const lfo = context.createOscillator();
  lfo.frequency.value = 24;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 0.006;
  lfo.connect(lfoDepth).connect(gain.gain);

  src.connect(filter).connect(gain).connect(out);
  src.start();
  lfo.start();
  gain.gain.linearRampToValueAtTime(0.028, context.currentTime + 1.8);
  ambient = { src, gain, lfo };
}

function stopAmbient(context: AudioContext) {
  if (!ambient) return;
  const a = ambient;
  ambient = null;
  a.gain.gain.cancelScheduledValues(context.currentTime);
  a.gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.6);
  setTimeout(() => {
    a.src.stop();
    a.lfo.stop();
  }, 700);
}

export const sound = {
  isEnabled: () => enabled,

  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Must be called from a user gesture. */
  async setEnabled(on: boolean) {
    if (on && !ctx) {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if (!ctx || !master) return;
    enabled = on;
    if (on) {
      await ctx.resume();
      startAmbient(ctx, master);
    } else {
      stopAmbient(ctx);
    }
    listeners.forEach((l) => l(on));
  },

  tick() {
    if (!enabled || !ctx || !master) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.05, false);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2600;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
  },

  /** A slower, lower mechanical sweep for the aperture opening. */
  aperture() {
    if (!enabled || !ctx || !master) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 1.2, false);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 1.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
  },
};
