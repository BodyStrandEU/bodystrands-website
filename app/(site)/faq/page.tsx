import { Metadata } from "next";
import Link from "next/link";
import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Bodystrands",
  description: "Answers to common questions about Bodystrands jewelry — sizing, materials, durability, shipping, returns, and more.",
  alternates: { canonical: "/faq" },
};

type FaqGroup = { title: string; items: FaqItem[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Product & Materials",
    items: [
      {
        question: "What is Bodystrands jewelry made of?",
        answer: "Every piece is crafted from high-quality stainless steel. Our Gold Tone pieces use a PVD (physical vapour deposition) gold coating — a far more durable finish than standard gold plating, which fades much faster.",
      },
      {
        question: "Is it waterproof? Can I shower or swim in it?",
        answer: "Yes. We test every design by soaking it in water for days at a time before it ever ships. Shower, swim, or sweat in it — the finish won't dull or discolor.",
      },
      {
        question: "Will it tarnish or turn my skin green?",
        answer: "No. Stainless steel doesn't tarnish, rust, or react with skin the way cheaper alloys do. It's also hypoallergenic, so it's a safe choice if you have sensitive skin.",
      },
      {
        question: "Is each piece adjustable?",
        answer: "Most of our chains — belly chains, back chains, anklets — are adjustable to fit a range of sizes. Check the specific product's size guide (linked on the product page) for exact measurements.",
      },
    ],
  },
  {
    title: "Sizing & Fit",
    items: [
      {
        question: "How do I know what size to order?",
        answer: "Each product page has a size guide button next to the size selector, showing exact measurements. Most of our body chains are adjustable within a range, so if you're between sizes, we recommend sizing up.",
      },
      {
        question: "What if my piece doesn't fit right?",
        answer: "Reach out to us at info@bodystrands.com with your order number — we're happy to help troubleshoot fit or arrange an exchange within our 14-day return window.",
      },
    ],
  },
  {
    title: "Orders & Shipping",
    items: [
      {
        question: "Where do you ship from, and how long does it take?",
        answer: "Every piece is handmade to order in Portugal and Canada. Please allow 1–2 business days for us to prepare your order, then 4–7 business days within the EU/UK, or 3–10 business days to the US and Canada.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship worldwide. Shipping rates and delivery estimates vary by region — see our full breakdown on the Shipping & Returns page.",
      },
      {
        question: "Will I be charged customs or import fees?",
        answer: "Orders to the UK, US, Canada, and Switzerland may be subject to import duties set by your local customs authority. These are outside our control and are the customer's responsibility.",
      },
      {
        question: "How do I track my order?",
        answer: "You'll receive a tracking link by email as soon as your order ships. You can also enter your tracking number directly on our Track Your Order page.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer: "Since pieces are made to order, we can only accommodate changes or cancellations within a few hours of purchase. Email us immediately at info@bodystrands.com and we'll do our best to help.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer: "You may return any unworn item in its original packaging within 14 days of delivery for a full refund of the item price. Return shipping is covered by the customer. US and Canada customers return to our Canadian address, so there's no need to ship internationally back to Portugal.",
      },
      {
        question: "How do I start a return?",
        answer: "Email info@bodystrands.com with your order number and reason for return. We'll respond within 1–2 business days with instructions.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay through our secure Stripe checkout.",
      },
      {
        question: "Do prices show in my local currency?",
        answer: "Yes. Prices automatically display in your local currency based on your location (USD, GBP, CAD, CHF, or EUR), and you're charged in that same currency at checkout.",
      },
      {
        question: "Is checkout secure?",
        answer: "Yes — all payments are processed through Stripe with full encryption. We never see or store your card details.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-14">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed max-w-lg">
          Can't find what you're looking for? Reach out at{" "}
          <a href="mailto:info@bodystrands.com" className="text-[#A0622A] hover:underline">
            info@bodystrands.com
          </a>{" "}
          — we typically reply within one business day.
        </p>
      </div>

      <div className="space-y-14">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-4">
              {group.title}
            </h2>
            <FaqAccordion items={group.items} />
          </section>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-[#E8B4A8]/40 flex flex-col sm:flex-row gap-4">
        <Link href="/shop" className="btn-primary-filled text-center text-[0.65rem]">
          Shop Now
        </Link>
        <Link href="/contact" className="btn-primary text-center text-[0.65rem]">
          Still Have a Question?
        </Link>
      </div>
    </div>
  );
}
