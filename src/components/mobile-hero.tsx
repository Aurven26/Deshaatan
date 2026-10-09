"use client";

import { useEffect, useRef, useState } from "react";

// Keep the mobile artwork separate: its crop and typography differ from desktop.
const slides = ["imgImage8", "imgImageNol", "imgImage9", "imgImage10", "imgImage11", "imgImage12", "imgImageNol1", "imgImage13", "imgImage14", "mobile-imgImage12", "mobile-imgImage13", "mobile-imgImageNol2", "imgImage15", "imgImage16", "imgImage50", "imgImageNol2", "imgImage17"];

export default function MobileHero() {
  const [index, setIndex] = useState(10);
  const [playing, setPlaying] = useState(false);
  const touchStart = useRef<number | null>(null);
  function advance(direction: number) { setIndex(value => (value + direction + slides.length) % slides.length); }
  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing]);
  return <section className="mobile-hero" aria-label="Explore India banners" onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => {
    if (touchStart.current === null) return;
    const distance = touchStart.current - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 40) advance(distance > 0 ? 1 : -1);
    touchStart.current = null;
  }}>
    {[-1, 0, 1].map(offset => {
      const name = slides[(index + offset + slides.length) % slides.length];
      return <div key={offset} className={`mobile-hero-panel ${offset < 0 ? "previous" : offset > 0 ? "next" : "current"} ${name === "mobile-imgImage13" ? "india-art" : ""}`}>
        <img src={`/figma/${name}.png`} alt={offset === 0 ? "Explore India" : ""} fetchPriority={offset === 0 ? "high" : "auto"} />
        {name === "mobile-imgImage13" && <div className="mobile-hero-copy"><strong>Explore India</strong><p>Timeless places incredible experiences</p></div>}
      </div>;
    })}
    <div className="mobile-hero-controls"><button aria-label={playing ? "Pause mobile slideshow" : "Play mobile slideshow"} onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▷"}</button><button aria-label="Next mobile banner" onClick={() => advance(1)}>{index + 1} / {slides.length} <span>+</span></button></div>
    <button className="mobile-hero-previous" aria-label="Previous mobile banner" onClick={() => advance(-1)}>‹</button>
  </section>;
}
