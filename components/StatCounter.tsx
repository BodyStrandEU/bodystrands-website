"use client";
import { useEffect, useRef, useState } from "react";

function initialDisplay(value: string) {
  const match = value.match(/^([\d,]+)(.*)$/);
  if (!match) return value;
  const target = parseInt(match[1].replace(/,/g, ""), 10);
  if (Number.isNaN(target)) return value;
  return "0" + match[2];
}

export default function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => initialDisplay(value));

  useEffect(() => {
    const match = value.match(/^([\d,]+)(.*)$/);
    const el = ref.current;
    if (!match || !el) return;

    const target = parseInt(match[1].replace(/,/g, ""), 10);
    const suffix = match[2];
    if (Number.isNaN(target)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1200;
        const start = performance.now();

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(target * eased).toLocaleString("en-US") + suffix);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
