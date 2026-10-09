"use client";

import { useEffect, useRef } from "react";
import { useReveal, type RevealTarget } from "./use-reveal";

const reveals: readonly RevealTarget[] = [
  { selector: ".deal-bar", variant: "fade-in" },
  { selector: ".hero", variant: "zoom-in" },
  { selector: ".categories > .category", stagger: 90 },
  { selector: ".section-heading" },
  { selector: ".packages-grid > *, .guides-grid > *", stagger: 90 },
  { selector: ".testimonial-heading", variant: "slide-left" },
  { selector: ".testimonial-card", stagger: 90 },
  { selector: ".itinerary > .content" },
  { selector: ".about > h2, .about-copy", variant: "slide-left" },
  { selector: ".city-links", variant: "slide-right", stagger: 90 },
];

export default function HomepageMotion() {
  useReveal(reveals);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const amount = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      progress.current?.style.setProperty("--scroll-progress", String(amount));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return <div ref={progress} className="scroll-progress" aria-hidden="true" />;
}
