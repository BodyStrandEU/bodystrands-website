import { Metadata } from "next";
import Link from "next/link";
import ShippingRatesTable from "@/components/ShippingRatesTable";

export const metadata: Metadata = {
  title: "Shipping & Returns — Bodystrands",
  description: "Shipping rates, delivery times, and return policy for Bodystrands. We ship worldwide from Portugal and Canada.",
};

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Shipping & Returns</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12">All orders are handmade and ship from Portugal and Canada.</p>

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
          <ShippingRatesTable />
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
            Customers in the United States and Canada return their item to our Canadian address —
            faster and more affordable than shipping back to Portugal. We&apos;ll send you the correct
            return address for your location once you reach out below.
          </p>
          <p className="mt-4">
            To initiate a return, email us at{" "}
            <a href="mailto:info@bodystrands.com" className="text-[#A0622A] hover:underline">
              info@bodystrands.com
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
            <a href="mailto:info@bodystrands.com" className="text-[#A0622A] hover:underline">
              info@bodystrands.com
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
            <a href="mailto:info@bodystrands.com" className="text-[#A0622A] hover:underline">
              info@bodystrands.com
            </a>{" "}
            — we typically reply within one business day.
          </p>
        </section>

      </div>
    </div>
  );
}
