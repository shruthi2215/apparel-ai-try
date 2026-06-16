import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  playBoom,
  playThunder,
  playRiser,
  playTick,
  playFanfare,
  playCircus,
  speak,
  stopSpeech,
} from "@/lib/cinemaSound";

/* ------------------------------------------------------------------ */
/*  Reusable bits                                                      */
/* ------------------------------------------------------------------ */

const VO_LINES = [
  "In a world where birthdays come only once a year...",
  "One person rises above all others...",
  "One name echoes across the universe...",
];

function Particles({ count = 40 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        dur: 3 + Math.random() * 4,
        size: 2 + Math.random() * 4,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-amber-300"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, top: "-5%" }}
          animate={{ y: ["0vh", "110vh"], opacity: [0, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Confetti({ count = 120 }: { count?: number }) {
  const colors = ["#FFD700", "#FF4D6D", "#4DD0E1", "#A78BFA", "#FF9F1C", "#06D6A0"];
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        dur: 2.5 + Math.random() * 3,
        color: colors[i % colors.length],
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-8%",
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: 2,
          }}
          animate={{ y: ["0vh", "115vh"], rotate: [p.rot, p.rot + 720], opacity: [1, 1, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 45,
        delay: Math.random() * 3,
        color: ["#FFD700", "#FF4D6D", "#4DD0E1", "#A78BFA"][i % 4],
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {Array.from({ length: 16 }).map((_, j) => {
            const angle = (j / 16) * Math.PI * 2;
            return (
              <motion.span
                key={j}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{ background: b.color }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(angle) * 90,
                  y: Math.sin(angle) * 90,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.4, delay: b.delay, repeat: Infinity, repeatDelay: 1.8 }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="mb-10 text-center font-black uppercase tracking-[0.2em] text-amber-300"
      style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem,5vw,3.2rem)" }}
    >
      {children}
    </motion.h2>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Phase = "gate" | "intro" | "main";

export default function IndrajaPage() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [voIndex, setVoIndex] = useState(-1);
  const [showName, setShowName] = useState(false);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [exploded, setExploded] = useState(false);

  const [showTrailer, setShowTrailer] = useState(false);
  const [chaos, setChaos] = useState(false);
  const stopCircusRef = useRef<null | (() => void)>(null);
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopSpeech();
      stopCircusRef.current?.();
    },
    [],
  );

  const runIntro = useCallback(async () => {
    setPhase("intro");
    playBoom(2.6, 42);
    // Voice-over lines
    for (let i = 0; i < VO_LINES.length; i++) {
      setVoIndex(i);
      if (i > 0) playBoom(1.4, 38);
      // eslint-disable-next-line no-await-in-loop
      await speak(VO_LINES[i]);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 350));
    }
    setVoIndex(-1);
    playRiser(1.6);
    await new Promise((r) => setTimeout(r, 1200));
    setShowName(true);
    speak("Indraja", { rate: 0.7, pitch: 0.5 });
    await new Promise((r) => setTimeout(r, 900));
    playThunder();
    setShake(true);
    setTimeout(() => setShake(false), 700);
    await new Promise((r) => setTimeout(r, 2200));
    setPhase("main");
  }, []);

  const startCountdown = useCallback(() => {
    if (countdown !== null || exploded) return;
    let n = 5;
    setCountdown(n);
    playTick(660);
    const tick = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(tick);
        setCountdown(0);
        setTimeout(() => {
          setCountdown(null);
          setExploded(true);
          playFanfare();
        }, 800);
        return;
      }
      setCountdown(n);
      playTick(660 + (5 - n) * 80);
    }, 1000);
    timers.current.push(tick);
  }, [countdown, exploded]);

  const toggleChaos = useCallback(() => {
    if (chaos) {
      setChaos(false);
      stopCircusRef.current?.();
      stopCircusRef.current = null;
      return;
    }
    setChaos(true);
    playThunder();
    stopCircusRef.current = playCircus();
    speak("Too late, Indraja. Birthday chaos activated.", { rate: 1, pitch: 1.4 });
  }, [chaos]);

  /* ---- GATE ---- */
  if (phase === "gate") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.4em] text-amber-400/70">A Cinematic Event</p>
          <h1
            className="mb-8 text-4xl font-black uppercase tracking-widest text-white sm:text-6xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Indraja
            <span className="mt-2 block text-base font-light tracking-[0.5em] text-amber-300">
              The Birthday Legend
            </span>
          </h1>
          <button
            onClick={runIntro}
            className="group relative rounded-full border border-amber-400/60 bg-amber-400/10 px-10 py-4 text-sm font-bold uppercase tracking-[0.3em] text-amber-200 transition hover:bg-amber-400 hover:text-black"
          >
            ▶ Begin the Legend
          </button>
          <p className="mt-6 text-xs text-white/40">Turn your sound on 🔊 for the full experience</p>
        </motion.div>
      </div>
    );
  }

  /* ---- INTRO ---- */
  if (phase === "intro") {
    return (
      <motion.div
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-center"
        animate={shake ? { x: [0, -14, 12, -10, 8, 0], y: [0, 8, -6, 4, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {voIndex >= 0 && !showName && (
            <motion.p
              key={voIndex}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-2xl font-light italic tracking-wide text-white/90 sm:text-4xl"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {VO_LINES[voIndex]}
            </motion.p>
          )}
        </AnimatePresence>

        {showName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 blur-3xl" style={{ background: "radial-gradient(circle,#fbbf24aa,transparent 70%)" }} />
            <h1
              className="text-6xl font-black uppercase tracking-[0.15em] text-amber-300 sm:text-8xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 40px #fbbf24" }}
            >
              ✨ Indraja ✨
            </h1>
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ---- MAIN ---- */
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <Particles count={30} />

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #000 70%)" }} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-xs uppercase tracking-[0.5em] text-amber-400/70"
        >
          Coming to Earth — Today Only
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-black uppercase leading-none tracking-tight sm:text-9xl"
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 60px #fbbf2466" }}
        >
          🎬 Indraja
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-lg font-light uppercase tracking-[0.4em] text-amber-300 sm:text-2xl"
        >
          The Birthday Legend
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-white/40">Scroll to witness greatness</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↓</motion.span>
        </motion.div>
      </section>

      {/* BREAKING NEWS / SCENE 1 */}
      <Scene>
        <SectionTitle>Scene 01 — First Contact</SectionTitle>
        <div className="mx-auto max-w-3xl space-y-4 text-center text-lg text-white/80">
          <p>NASA detects an unusual energy source.</p>
          <p>Scientists are panicking. News channels around the world interrupt programming.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-lg border-2 border-red-600 bg-red-600/10"
        >
          <div className="flex items-center gap-3 bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-widest">
            <span className="animate-pulse">● Live</span> Breaking News
          </div>
          <p className="px-4 py-6 text-xl font-bold sm:text-2xl">🚨 INDRAJA'S BIRTHDAY HAS ARRIVED 🚨</p>
        </motion.div>
      </Scene>

      {/* SCENE 2 */}
      <Scene>
        <SectionTitle>Scene 02 — The Briefing Room</SectionTitle>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-white/70">A secret government meeting. Officials looking concerned.</p>
        <div className="mx-auto max-w-xl space-y-4">
          {[
            { q: true, t: '"Are we prepared?"' },
            { q: false, t: '"No one can truly prepare for this."' },
          ].map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: d.q ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={`max-w-[80%] rounded-2xl px-5 py-3 text-lg ${
                d.q ? "bg-white/10" : "ml-auto bg-amber-400/20 text-amber-100"
              }`}
            >
              {d.t}
            </motion.div>
          ))}
        </div>
      </Scene>

      {/* SCENE 3 — COUNTDOWN */}
      <Scene>
        <SectionTitle>Scene 03 — The Countdown</SectionTitle>
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {countdown !== null && countdown > 0 && (
              <motion.div
                key={countdown}
                initial={{ scale: 2.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                className="text-9xl font-black text-amber-300"
                style={{ textShadow: "0 0 50px #fbbf24" }}
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>

          {!exploded && countdown === null && (
            <button
              onClick={startCountdown}
              className="rounded-full bg-amber-400 px-10 py-4 text-sm font-black uppercase tracking-[0.3em] text-black transition hover:scale-105"
            >
              ▶ Launch Countdown
            </button>
          )}

          {exploded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative text-center"
            >
              <div className="mb-4 text-3xl">🎆 🎈 🎉 ✨ 🌟</div>
              <h3
                className="text-5xl font-black uppercase tracking-tight text-amber-300 sm:text-7xl"
                style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 50px #fbbf24" }}
              >
                Indraja
              </h3>
              <p className="mt-2 text-lg uppercase tracking-[0.4em] text-white/80">The Birthday Legend</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-amber-400/80">Coming to Earth — Today Only</p>
            </motion.div>
          )}
        </div>
        {exploded && <Fireworks />}
      </Scene>

      {/* CHARACTER CARD */}
      <Scene>
        <SectionTitle>The Legend</SectionTitle>
        <motion.div
          initial={{ opacity: 0, rotateY: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-md overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-400/10 to-transparent p-8 backdrop-blur"
          style={{ boxShadow: "0 0 60px #fbbf2422" }}
        >
          <div className="mb-4 text-center text-6xl">⭐</div>
          <h3 className="text-center text-4xl font-black text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Indraja
          </h3>
          <p className="mb-6 mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/50">Known For</p>
          <ul className="space-y-2 text-white/85">
            <li>• Making people laugh</li>
            <li>• Creating unforgettable memories</li>
            <li>• Being absolutely iconic</li>
            <li>• Surviving another year successfully</li>
          </ul>
          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-amber-400/80">Special Power</p>
            <p className="mt-1 text-lg font-bold text-amber-200">"Maximum Main Character Energy"</p>
          </div>
        </motion.div>
      </Scene>

      {/* MISSION BRIEFING */}
      <Scene>
        <SectionTitle>Mission Briefing</SectionTitle>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { k: "Mission", v: "Celebrate Indraja." },
            { k: "Objective", v: "Maximum Happiness." },
            { k: "Status", v: "Mission Active." },
            { k: "Success Chance", v: "100%" },
          ].map((m, i) => (
            <motion.div
              key={m.k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 font-mono"
            >
              <p className="text-xs uppercase tracking-widest text-green-400/80">{m.k}</p>
              <p className="mt-1 text-xl font-bold text-green-300">{m.v}</p>
            </motion.div>
          ))}
        </div>
      </Scene>

      {/* SECRET TRAILER */}
      <Scene>
        <div className="text-center">
          <button
            onClick={() => {
              setShowTrailer((v) => !v);
              if (!showTrailer) {
                playRiser(1.2);
                playBoom(1.6, 44);
              }
            }}
            className="rounded-full border border-amber-400 bg-black px-10 py-4 text-sm font-black uppercase tracking-[0.3em] text-amber-300 transition hover:bg-amber-400 hover:text-black"
          >
            🎥 Watch Secret Trailer
          </button>
        </div>
        <AnimatePresence>
          {showTrailer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-auto mt-8 max-w-2xl space-y-3 overflow-hidden"
            >
              {[
                "Indraja vs Monday Morning",
                "The Fast and the Curious",
                "Mission: Eat the Birthday Cake",
                "Avengers: Endgame of Diet Plans",
              ].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.25 }}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-center text-xl font-bold italic tracking-wide"
                >
                  🎬 "{t}"
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Scene>

      {/* REVIEWS */}
      <Scene>
        <SectionTitle>Critics Agree</SectionTitle>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { r: "A masterpiece.", by: "International Birthday Academy" },
            { r: "Better than every superhero movie combined.", by: "Birthday Critics Association" },
            { r: "Changed my life.", by: "Random Person On The Internet" },
          ].map((rev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="mb-3 text-amber-400">★★★★★</div>
              <p className="text-lg font-semibold italic">"{rev.r}"</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-white/40">— {rev.by}</p>
            </motion.div>
          ))}
        </div>
      </Scene>

      {/* DO NOT PRESS */}
      <Scene>
        <div className="text-center">
          <motion.button
            onClick={toggleChaos}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="rounded-2xl border-4 border-red-700 bg-red-600 px-12 py-6 text-xl font-black uppercase tracking-[0.2em] text-white shadow-[0_0_40px_#dc2626] hover:bg-red-500"
          >
            ⚠️ Do Not Press ⚠️
          </motion.button>
          <p className="mt-4 text-xs uppercase tracking-widest text-white/40">(seriously, don't)</p>
        </div>
      </Scene>

      {/* GRAND FINALE */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 50% 50%, #4c1d95 0%, #000 70%)" }} />
        <Fireworks />
        <Particles count={40} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="mb-6 text-7xl">🎂</div>
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400">🏆 Achievement Unlocked</p>
          <h2
            className="mt-3 text-5xl font-black uppercase tracking-tight text-amber-300 sm:text-7xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 50px #fbbf24" }}
          >
            Level 100: Indraja
          </h2>
          <p className="mt-2 text-lg uppercase tracking-[0.3em] text-white/70">The Birthday Legend</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-12 max-w-2xl space-y-4 text-lg leading-relaxed text-white/85"
        >
          <p>Some heroes wear capes. Some heroes save the world.</p>
          <p>But today we celebrate someone even more important.</p>
          <p className="text-2xl font-bold text-amber-300">Indraja.</p>
          <p>
            Thank you for making life brighter, happier, and more fun for everyone around you. May your next chapter be
            filled with adventure, laughter, success, and unforgettable memories.
          </p>
          <p className="text-3xl font-black text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Happy Birthday, Indraja. 🎉
          </p>
        </motion.div>
      </section>

      {/* CREDITS */}
      <section className="bg-black px-6 py-24 text-center">
        <div className="mx-auto max-w-md space-y-6 text-white/70">
          {[
            ["Directed by", "The Universe"],
            ["Produced by", "Friendship"],
            ["Special Effects by", "Cake & Confetti Studios"],
          ].map(([k, v]) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{k}</p>
              <p className="text-xl font-semibold text-white">{v}</p>
            </motion.div>
          ))}
          <div className="pt-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Starring</p>
            <p className="mt-2 text-4xl font-black text-amber-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              🌟 Indraja 🌟
            </p>
            <div className="mt-3 space-y-1 text-sm uppercase tracking-widest text-white/60">
              <p>The Legend.</p>
              <p>The Icon.</p>
              <p>The Birthday Queen.</p>
              <p>The Main Character.</p>
            </div>
          </div>
          <p className="pt-10 text-2xl font-black uppercase tracking-[0.4em] text-white">The End 🎬</p>
        </div>
      </section>

      {/* CHAOS OVERLAY */}
      <AnimatePresence>
        {chaos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-fuchsia-600/30 backdrop-blur-sm"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const emoji = i % 2 === 0 ? "🍌" : "🦆";
              return (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  style={{ left: `${Math.random() * 95}%`, top: "-10%" }}
                  animate={{ y: ["0vh", "110vh"], rotate: [0, 720] }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 1.5,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                >
                  {emoji}
                </motion.span>
              );
            })}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: [-3, 3, -3] }}
              transition={{ rotate: { repeat: Infinity, duration: 0.5 } }}
              className="z-[81] rounded-3xl border-4 border-yellow-300 bg-black/80 px-10 py-8 text-center"
            >
              <p className="text-3xl font-black text-yellow-300">⚠️ Too late, Indraja. ⚠️</p>
              <p className="mt-2 text-xl font-bold text-white">Birthday Chaos Activated.</p>
              <button
                onClick={toggleChaos}
                className="mt-6 rounded-full bg-yellow-300 px-6 py-2 text-sm font-bold uppercase tracking-widest text-black"
              >
                Make it stop 😅
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {chaos && <Confetti count={80} />}
    </div>
  );
}

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}