"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            // Animate skill bars
            const fills = entry.target.querySelectorAll<HTMLElement>(".skill-bar-fill");
            fills.forEach((fill) => {
              const w = fill.getAttribute("data-width");
              setTimeout(() => {
                fill.style.width = w + "%";
              }, 200);
            });

            // Animate counters
            const counters = entry.target.querySelectorAll<HTMLElement>(".counter");
            counters.forEach((el) => {
              if (!el.dataset.done) {
                el.dataset.done = "1";
                const target = +(el.getAttribute("data-target") ?? 0);
                const dur = 1800;
                const inc = target / (dur / 16);
                let cur = 0;
                const tick = () => {
                  cur += inc;
                  if (cur < target) {
                    el.textContent = Math.ceil(cur) + "+";
                    requestAnimationFrame(tick);
                  } else {
                    el.textContent = target + "+";
                  }
                };
                tick();
              }
            });
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Immediately reveal above-fold elements
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("visible");
    });

    return () => observer.disconnect();
  }, []);
}
