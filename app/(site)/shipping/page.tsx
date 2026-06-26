import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Returns — Bodystrands",
  description: "Shipping rates, delivery times, and return policy for Bodystrands. We ship worldwide from Portugal.",
};

const SHIPPING_ZONES = [
  {
    zone: "European Union",
    rate: "€5.00",
    freeOver: "Free over €50",
    delivery: "4–7 business days",
    countries: "Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden",
  },
  {
    zone: "United Kingdom & Switzerland",
    rate: "€8.00",
    freeOver: "Free over €50",
    delivery: "4–7 business days",
    countries: "United Kingdom, Switzerland",
  },
  {
    zone: "USA & Canada",
    rate: "€8.00",
    freeOver: "Free over €50",
    delivery: "7–14 business days",
    countries: "United States, Canada",
  },
];

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Shipping & Returns</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12">All orders are handmade and ship from Portugal.</p>

      <div className="space-y-12 font-cormorant text-lg leading-relaxed text-[#2C2220]">

        {/* Processing */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Processing Time</h2>
          <p>
            Every piece is made by hand. Please allow <strong>1–2 business days</strong> for your order
            to be prepared and packed before it ships. You will receive a tracking confirmation by email
            once your order is on its way.
          </p>
        </section>

        {/* Rates */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-5">Shipping Rates</h2>
          <div className="space-y-4">
            {SHIPPING_ZONES.map((z) => (
              <div key={z.zone} className="border border-[#E8B4A8]/40 p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <span className="font-josefin text-sm tracking-wider uppercase text-[#2C2220]">{z.zone}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-josefin text-sm text-[#A0622A]">{z.rate}</span>
                    {z.freeOver && (
                      <>
                        <span className="text-[#8C7B6E] text-base">·</span>
                        <span className="font-josefin text-xs tracking-wide text-[#A0622A]/70">{z.freeOver}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-base text-[#8C7B6E] mb-1">Estimated delivery: {z.delivery}</p>
                <p className="text-sm text-[#8C7B6E]/70 leading-snug">{z.countries}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Customs */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Customs & Duties</h2>
          <p>
            Orders shipped to the United Kingdom, United States, Canada, and Switzerland may be subject
            to import duties or taxes upon arrival. These charges are determined by your local customs
            authority and are the responsibility of the customer. Bodystrands has no control over these
            fees and cannot predict their amount.
          </p>
        </section>

        {/* Returns */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Returns & Exchanges</h2>
          <p className="mb-4">
            We want you to love your Bodystrands piece. If something isn&apos;t right, you may return
            it within <strong>14 days</strong> of delivery for a full refund of the item price.
          </p>
          <p className="mb-4">To be eligible for a return:</p>
          <ul className="list-disc list-inside space-y-1.5 text-base ml-2">
            <li>The item must be unworn and in its original condition</li>
            <li>It must be returned in the original packaging</li>
            <li>Return shipping costs are covered by the customer</li>
          </ul>
          <p className="mt-4">
            To initiate a return, email us at{" "}
            <a href="mailto:storenavaria@gmail.com" className="text-[#A0622A] hover:underline">
              storenavaria@gmail.com
            </a>{" "}
            with your order number and reason for return. We will respond within 1–2 business days
            with instructions.
          </p>
        </section>

        {/* Damaged */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Damaged or Lost Orders</h2>
          <p>
            If your order arrives damaged or does not arrive within the estimated timeframe, please
            contact us immediately at{" "}
            <a href="mailto:storenavaria@gmail.com" className="text-[#A0622A] hover:underline">
              storenavaria@gmail.com
            </a>
            . We will do everything we can to resolve the issue quickly.
          </p>
        </section>

        {/* Track */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Track Your Order</h2>
          <p>
            Already shipped?{" "}
            <Link href="/track" className="text-[#A0622A] hover:underline">
              Enter your tracking number here
            </Link>{" "}
            to follow your parcel in real time.
          </p>
        </section>

        {/* Questions */}
        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Questions?</h2>
          <p>
            Reach us anytime at{" "}
            <a href="mailto:storenavaria@gmail.com" className="text-[#A0622A] hover:underline">
              storenavaria@gmail.com
            </a>{" "}
            — we typically reply within one business day.
          </p>
        </section>

      </div>
    </div>
  );
}
