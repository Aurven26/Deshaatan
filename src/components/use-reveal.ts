"use client";

import { useEffect } from "react";

export type RevealVariant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "zoom-in";
export type RevealTarget = {
  selector: string;
  variant?: RevealVariant;
  /** Delay between siblings, in milliseconds. */
  stagger?: number;
};

/**
 * Animates existing elements without introducing wrappers into flex/grid layouts.
 * Keep the targets array stable (declare it outside the component).
 * Server HTML and unobserved elements stay visible: only a running animation
 * changes opacity, and its backwards fill expires even if JS stops afterwards.
 */
export function useReveal(targets: readonly RevealTarget[]) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!("IntersectionObserver" in window)) return;
    const registered = new Set<HTMLElement>();
    const finished = new WeakSet<Element>();
    const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const complete = (element: HTMLElement) => {
      element.dataset.revealState = "done";
      const timer = timers.get(element);
      if (timer) clearTimeout(timer);
      timers.delete(element);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.15 || finished.has(entry.target)) continue;
        const element = entry.target as HTMLElement;
        finished.add(element);
        observer.unobserve(element);
        if (reducedMotion.matches || element.contains(document.activeElement)) {
          complete(element);
          continue;
        }
        element.dataset.revealState = "running";
        const delay = Number.parseFloat(element.style.getPropertyValue("--reveal-delay")) || 0;
        timers.set(element, setTimeout(() => complete(element), 700 + delay));
      }
    }, { threshold: 0.15 });

    const register = () => {
      for (const { selector, variant = "fade-up", stagger = 0 } of targets) {
        const siblingIndices = new Map<Element | null, number>();
        document.querySelectorAll<HTMLElement>(selector).forEach(element => {
          const index = siblingIndices.get(element.parentElement) || 0;
          siblingIndices.set(element.parentElement, index + 1);
          if (registered.has(element)) return;
          registered.add(element);
          element.dataset.reveal = variant;
          element.style.setProperty("--reveal-delay", `${Math.min(index * stagger, 540)}ms`);
          if (reducedMotion.matches) {
            finished.add(element);
            complete(element);
          } else observer.observe(element);
        });
      }
    };
    const stopMotion = () => {
      if (!reducedMotion.matches) return;
      observer.disconnect();
      registered.forEach(element => { finished.add(element); complete(element); });
    };
    // Focusing an element must never leave it transparent during its stagger delay.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-reveal]");
      if (element && registered.has(element)) {
        finished.add(element);
        observer.unobserve(element);
        complete(element);
      }
    };
    register();
    // Handles filtered/reinserted package cards, without resetting other reveals.
    const mutations = new MutationObserver(register);
    document.querySelectorAll(".packages-grid").forEach(grid => mutations.observe(grid, { childList: true }));
    reducedMotion.addEventListener("change", stopMotion);
    document.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      reducedMotion.removeEventListener("change", stopMotion);
      document.removeEventListener("focusin", onFocus);
      timers.forEach(clearTimeout);
      registered.forEach(element => {
        delete element.dataset.reveal;
        delete element.dataset.revealState;
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, [targets]);
}
