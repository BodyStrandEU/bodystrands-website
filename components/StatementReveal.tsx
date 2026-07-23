"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function StatementReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    if (!section || !line1 || !line2) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: section,
        start: "top 85%",
        end: "top 30%",
        scrub: true,
      };
      gsap.fromTo(line1, { xPercent: -14, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(line2, { xPercent: 14, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: trigger });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#2C2220] py-24 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p
          ref={line1Ref}
          className="font-heading font-light text-[#E8B4A8] leading-[0.88] tracking-tight"
          style={{ fontSize: "clamp(3.2rem, 9vw, 7.5rem)" }}
        >
          Put it on.
        </p>
        <p
          ref={line2Ref}
          className="font-heading font-light italic text-white leading-[0.88] tracking-tight text-right"
          style={{ fontSize: "clamp(3.2rem, 9vw, 7.5rem)" }}
        >
          Leave it on.
        </p>
      </div>
    </section>
  );
}
