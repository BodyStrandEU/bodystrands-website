import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jewelry Care — Bodystrands",
  description: "How to care for your Bodystrands jewelry. Tips for cleaning, storing, and making your stainless steel pieces last a lifetime.",
};

const CARE_SECTIONS = [
  {
    title: "Your Jewelry is Built to Last",
    body: `All Bodystrands pieces are crafted from 316L surgical-grade stainless steel — the same material used in medical implants. It is naturally tarnish-resistant, hypoallergenic, and does not require any special maintenance to stay beautiful.`,
  },
  {
    title: "It's Waterproof",
    body: `You can wear your Bodystrands jewelry in the shower, the pool, or the ocean. Stainless steel does not rust or tarnish from water exposure. That said, we recommend rinsing your piece with fresh water after prolonged exposure to chlorine or saltwater, and patting it dry with a soft cloth.`,
  },
  {
    title: "Cleaning Your Piece",
    body: `For day-to-day care, a quick rinse under warm water is all you need. If your jewelry needs a deeper clean — for example after contact with lotions, perfume, or oils — gently wash it with a small amount of mild soap and warm water, then rinse thoroughly and pat dry with a soft, lint-free cloth. Avoid abrasive cloths or brushes that can scratch the surface.`,
  },
  {
    title: "What to Avoid",
    body: `While stainless steel is highly durable, a few things can dull its finish over time:\n\n• Harsh chemicals such as bleach, ammonia, or acetone\n• Applying perfume, hairspray, or sunscreen directly onto the jewelry\n• Leaving the piece in contact with rubber or latex for extended periods`,
  },
  {
    title: "Storing Your Jewelry",
    body: `When you're not wearing your piece, store it in the pouch or box it came in — or any soft, dry container. Keeping it away from direct sunlight and humidity will help it stay looking its best. Avoid storing multiple pieces together loose, as they can scratch each other.`,
  },
  {
    title: "Polishing",
    body: `If your piece loses some of its shine, buff it gently with a soft microfibre cloth in small circular motions. This is usually all it takes to restore the original finish. No specialist products are needed.`,
  },
  {
    title: "Gold-Tone Pieces",
    body: `Our Gold Tone pieces feature a PVD (physical vapour deposition) gold coating over stainless steel — a far more durable finish than traditional gold plating. With proper care, the coating will stay vibrant for years. Avoid submerging Gold Tone pieces in harsh chemicals, and remove them before using cleaning products.`,
  },
];

export default function CarePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">

      <div className="mb-12">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">
          Jewelry Care
        </h1>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-lg">
          Our pieces are made to be worn every day. Here is everything you need to know
          to keep them looking beautiful for years to come.
        </p>
      </div>

      <div className="space-y-10">
        {CARE_SECTIONS.map((s) => (
          <section key={s.title} className="border-t border-[#E8B4A8]/40 pt-8">
            <h2 className="font-josefin text-sm tracking-widest uppercase text-[#2C2220] mb-4">
              {s.title}
            </h2>
            <div className="font-cormorant text-lg leading-relaxed text-[#8C7B6E] whitespace-pre-line">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-[#E8B4A8]/40 flex flex-col sm:flex-row gap-4">
        <Link href="/shop" className="btn-primary-filled text-center text-[0.65rem]">
          Shop Now
        </Link>
        <Link href="/contact" className="btn-primary text-center text-[0.65rem]">
          Have a Question?
        </Link>
      </div>
    </div>
  );
}
