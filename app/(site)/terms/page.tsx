import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Bodystrands",
  description: "Terms and Conditions for purchasing from Bodystrands.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Terms & Conditions</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12">Last updated: June 2026</p>

      <div className="space-y-10 font-cormorant text-lg leading-relaxed text-[#2C2220]">

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">1. Overview</h2>
          <p>By purchasing from Bodystrands (bodystrands.com), you agree to these terms. Please read them carefully before placing an order.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">2. Products</h2>
          <p>All Bodystrands jewelry is handmade. Slight variations in appearance may occur between pieces — this is a feature of handmade craft, not a defect. Product images are as accurate as possible but may vary slightly in colour depending on your screen.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">3. Orders & Payment</h2>
          <p>All prices are listed in Euros (€). Payment is processed securely through Stripe. We reserve the right to cancel any order at our discretion, in which case a full refund will be issued.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">4. Shipping</h2>
          <p>We ship from Europe. Delivery times vary by destination. We are not responsible for delays caused by customs or postal services. Shipping costs are calculated at checkout.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">5. Returns & Refunds</h2>
          <p>We accept returns within 14 days of delivery for unworn, undamaged items in original condition. To initiate a return, contact us at hello@bodystrands.com. Return shipping costs are the buyer's responsibility unless the item is faulty.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">6. Faulty Items</h2>
          <p>If your item arrives damaged or faulty, contact us within 7 days with a photo. We will replace or refund at no cost to you.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">7. Intellectual Property</h2>
          <p>All images, designs, and content on bodystrands.com are owned by Bodystrands. You may not reproduce or use them without written permission.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">8. Contact</h2>
          <p>For any questions about your order or these terms, reach us at hello@bodystrands.com.</p>
        </section>

      </div>
    </div>
  );
}
