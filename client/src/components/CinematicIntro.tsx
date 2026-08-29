import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { CINEMATIC_ASSETS } from "@/game/assets";
import { ConferenceFooter } from "@/components/ConferenceFooter";
import type { CinematicCallbacks, CinematicHandle } from "@/game/scene";
import type { CinematicPhase } from "@/game/cinematic";
import "@/styles/cinematic.css";

interface CinematicIntroProps { onIntroComplete?: () => void; reducedMotion?: boolean; }

export function CinematicIntro({ onIntroComplete, reducedMotion = false }: CinematicIntroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const handleRef = useRef<CinematicHandle | null>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [previewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("grab")) return "grab";
    if (params.has("throw")) return "throw";
    if (params.has("vault")) return "vault";
    if (params.has("sprint")) return "sprint";
    return params.has("demo") ? "demo" : "live";
  });
  const previewTimes = { sprint: 3.15, vault: 3.85, grab: 7.7, throw: 8.55 } as const;
  const isActionPreview = previewMode in previewTimes;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(reducedMotion);
  const [phase, setPhase] = useState<CinematicPhase>(previewMode === "demo" ? "reveal" : isActionPreview ? (previewMode as CinematicPhase) : "opening");
  const [webglFailed, setWebglFailed] = useState(false);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = 0.34;

    const startMusic = async () => {
      if (!audio.paused) return;
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      try {
        await audio.play();
      } catch {
        // Browsers may block autoplay until the visitor interacts with the page.
      }
    };
    const retryOnInteraction = () => { void startMusic(); };
    void startMusic();
    window.addEventListener("pointerdown", retryOnInteraction, true);
    window.addEventListener("keydown", retryOnInteraction, true);
    return () => {
      window.removeEventListener("pointerdown", retryOnInteraction, true);
      window.removeEventListener("keydown", retryOnInteraction, true);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !stageRef.current) return undefined;
    let cancelled = false;
    const callbacks: CinematicCallbacks = {
      demo: previewMode === "demo",
      startAt: isActionPreview ? previewTimes[previewMode as keyof typeof previewTimes] : undefined,
      freezeAt: isActionPreview ? previewTimes[previewMode as keyof typeof previewTimes] : undefined,
      onProgress: (value) => setProgress(Math.round(value)),
      onReady: () => { if (!cancelled) setReady(true); },
      onPhase: (nextPhase) => { if (!cancelled) setPhase(nextPhase); },
    };
    import("@/game/scene")
      .then(({ createCinematic }) => createCinematic(stageRef.current!, callbacks))
      .then((handle) => { if (cancelled) handle.dispose(); else handleRef.current = handle; })
      .catch(() => { if (!cancelled) { setWebglFailed(true); setReady(true); setPhase("reveal"); } });
    return () => { cancelled = true; handleRef.current?.dispose(); handleRef.current = null; };
  }, [isActionPreview, previewMode, reducedMotion]);

  useEffect(() => {
    if (phase !== "reveal" || !revealRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(revealRef.current, { autoAlpha: 0, y: 18, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.15, ease: "power3.out", delay: 0.15 });
    }, revealRef);
    return () => context.revert();
  }, [phase]);

  const completeIntro = () => {
    handleRef.current?.stop();
    audioRef.current?.pause();
    window.sessionStorage.setItem("leadlead:intro-seen", "1");
    window.dispatchEvent(new CustomEvent("leadlead:intro-complete"));
    onIntroComplete?.();
    setExited(true);
  };

  if (exited) return null;
  const revealActive = reducedMotion || phase === "reveal" || webglFailed;
  const impactActive = phase === "impact" && !revealActive;

  return (
    <main className={`cinematic-shell ${reducedMotion ? "is-static" : ""}`} aria-label="Lead & Lead opening cinematic">
      <audio ref={audioRef} src={CINEMATIC_ASSETS.entryMusic} loop preload="auto" aria-label="Lead & Lead entry music" />
      <div ref={stageRef} className="cinematic-stage" style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 9, 16, 0.15), rgba(3, 6, 11, 0.58)), url(${CINEMATIC_ASSETS.rooftopReference})` }} />
      <div className={`cinematic-vignette ${revealActive ? "is-quiet" : ""}`} aria-hidden="true" />
      <div className="cinematic-motion-lines" aria-hidden="true" />
      <div className="cinematic-relic-signal" aria-hidden="true" />
      <div className={`cinematic-impact ${impactActive ? "is-active" : ""}`} aria-hidden="true"><img src={CINEMATIC_ASSETS.spark} alt="" /></div>
      {!reducedMotion && <section className={`cinematic-loader ${ready ? "is-ready" : ""}`} aria-live="polite"><p>LOADING<span className="loader-dots">...</span></p><div className="loader-rule" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div><small>{progress}% · ESTABLISHING THE NIGHT</small></section>}
      <div className="cinematic-controls">
        <button className="cinematic-skip" type="button" onClick={completeIntro}>SKIP INTRO <span aria-hidden="true">↗</span></button>
      </div>
      {webglFailed && <div className="cinematic-fallback-note">Live graphics are unavailable on this device. The cinematic has resolved to its final title card.</div>}
      <section ref={revealRef} className={`cinematic-reveal ${revealActive ? "is-active" : ""}`} aria-hidden={!revealActive}>
        <div className="reveal-streak" aria-hidden="true" />
        <div className="presentation-lockup"><div className="thyna-seal"><img className="official-logo thyna-intro-mark" src={CINEMATIC_ASSETS.logo} alt="LC Thyna logo" /></div><div className="presentation-line"><i /><span>LC THYNA</span><i /></div><p>PROUDLY PRESENTS</p><h1>LEAD <em>&</em> LEAD <small>2K26</small></h1><div className="reveal-subtitle"><span>THE LEADERSHIP GATHERING</span><i /><strong>10 SEPTEMBER 2026</strong></div></div>
        <button type="button" className="enter-button" onClick={completeIntro}><span>ENTER WORLD</span><b aria-hidden="true">→</b></button>
      </section>
      <ConferenceFooter compact />
    </main>
  );
}
