import { useEffect, useState } from "react";
import { CinematicIntro } from "@/components/CinematicIntro";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import "@/styles/mobile-layout.css";
import "@/styles/mobile-final-fixes.css";

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) setSkipIntro(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (!skipIntro) return;
    window.history.replaceState({}, "", "/home");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [skipIntro]);

  if (skipIntro) return null;
  return <div className="intro-route"><ConferenceHeader current="home" /><CinematicIntro reducedMotion={reducedMotion} onIntroComplete={() => { window.history.pushState({}, "", "/home"); window.dispatchEvent(new PopStateEvent("popstate")); }} /></div>;
}
