import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy — Bodystrands",
  description: "Bodystrands return policy. 14-day returns accepted for any reason. Return shipping is at the buyer's expense.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Return Policy</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12">
        Last updated: June 2026 · Applies to all orders placed at bodystrands.com
      </p>

      <div className="space-y-12 font-cormorant text-lg leading-relaxed text-[#2C2220]">

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Our Commitment</h2>
          <p>
            We stand behind every piece we make. If for any reason you are not completely satisfied
            with your order, you may return it within <strong>14 days</strong> of delivery for a
            full refund of the item price — no questions asked.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Return Window</h2>
          <p>
            You have <strong>14 days</strong> from the date your order is delivered to request a
            return. Requests received after this period will not be eligible for a refund.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Eligibility</h2>
          <p className="mb-4">To qualify for a return, your item must meet the following conditions:</p>
          <ul className="list-disc list-inside space-y-1.5 text-base ml-2">
            <li>Returned within 14 days of the delivery date</li>
            <li>Unworn and in its original condition</li>
            <li>Returned in the original packaging</li>
            <li>Not damaged due to misuse or improper care</li>
          </ul>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Return Shipping</h2>
          <p>
            Return shipping costs are the responsibility of the buyer. We recommend using a tracked
            shipping service, as Bodystrands cannot be held responsible for items lost or damaged
            in transit on the way back to us.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Refunds</h2>
          <p>
            Once we receive and inspect your return, we will process a full refund of the item
            price to your original payment method within <strong>5–10 business days</strong>.
            Original shipping costs are non-refundable. You will receive an email confirmation
            when your refund has been issued.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Damaged or Defective Items</h2>
          <p>
            If your item arrives damaged or defective, please contact us within 48 hours of
            delivery with a photo of the damage. In this case, we will cover the cost of the
            return and send you a replacement or issue a full refund — whichever you prefer.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">How to Start a Return</h2>
          <p className="mb-4">To initiate a return, email us at{" "}
            <a href="mailto:hello@bodystrands.com" className="text-[#A0622A] hover:underline">
              hello@bodystrands.com
            </a>{" "}
            with:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-base ml-2">
            <li>Your order number</li>
            <li>The item(s) you wish to return</li>
            <li>The reason for your return</li>
          </ul>
          <p className="mt-4">
            We will respond within 1–2 business days with your return address and further
            instructions.
          </p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">Questions?</h2>
          <p>
            Reach us anytime at{" "}
            <a href="mailto:hello@bodystrands.com" className="text-[#A0622A] hover:underline">
              hello@bodystrands.com
            </a>{" "}
            — we typically reply within one business day.
          </p>
        </section>

      </div>
    </div>
  );
}
