// Lightweight cinematic sound engine using the Web Audio API.
// No external assets required — everything is synthesized.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Deep cinematic sub-bass rumble (like the Inception "BRAAAM"). */
export function playBoom(duration = 2.2, baseFreq = 48) {
  const ac = getCtx();
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.9, now + 0.15);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(ac.destination);

  [baseFreq, baseFreq * 1.5, baseFreq * 0.5].forEach((f, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 2 ? "sine" : "sawtooth";
    osc.frequency.setValueAtTime(f * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(f, now + 0.6);
    const g = ac.createGain();
    g.gain.value = i === 0 ? 0.6 : 0.25;
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + duration);
  });
}

/** Thunder crack — burst of filtered noise. */
export function playThunder() {
  const ac = getCtx();
  const now = ac.currentTime;
  const bufferSize = ac.sampleRate * 1.4;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 1.2);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.9, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
  noise.connect(filter).connect(g).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 1.4);
  playBoom(1.6, 40);
}

/** Short rising "riser" used before a reveal. */
export function playRiser(duration = 1.8) {
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + duration);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.25, now + duration * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration);
}

/** A single bright "ding" — used for countdown ticks. */
export function playTick(freq = 880) {
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

/** Celebratory ascending arpeggio + boom for the big explosion. */
export function playFanfare() {
  const ac = getCtx();
  const now = ac.currentTime;
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => {
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f;
    const g = ac.createGain();
    const t = now + i * 0.09;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  });
  playBoom(2.5, 55);
}

/** Silly circus loop for chaos mode. Returns a stop function. */
export function playCircus(): () => void {
  const ac = getCtx();
  const melody = [523, 587, 659, 587, 523, 659, 784, 659];
  let step = 0;
  const interval = window.setInterval(() => {
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = melody[step % melody.length];
    const g = ac.createGain();
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(g).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.25);
    step++;
  }, 220);
  return () => window.clearInterval(interval);
}

/** Movie-trailer style voice-over via SpeechSynthesis. */
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.82;
    u.pitch = opts.pitch ?? 0.6;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const deep = voices.find((v) => /male|daniel|google uk english male|fred/i.test(v.name));
    if (deep) u.voice = deep;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}