import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Bodystrands",
  description: "Privacy Policy for Bodystrands. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
      <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-4">Privacy Policy</h1>
      <p className="text-sm font-light tracking-wide text-[#8C7B6E] leading-relaxed mb-12">Last updated: June 2026</p>

      <div className="space-y-10 font-cormorant text-lg leading-relaxed text-[#2C2220]">

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">1. Who We Are</h2>
          <p>Bodystrands is a handmade body jewelry brand selling through bodystrands.com. Our contact email is info@bodystrands.com.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">2. What Data We Collect</h2>
          <p>When you place an order or contact us, we may collect your name, email address, shipping address, and payment information. Payment data is processed securely through Stripe and we never store your card details.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">3. How We Use Your Data</h2>
          <p>We use your data solely to process and fulfil your order, communicate with you about your purchase, and improve our website. We do not sell your data to third parties.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">4. Cookies & Analytics</h2>
          <p>We use Google Analytics to understand how visitors use our site. This may collect anonymised data about your visit including pages viewed and time spent. You can opt out via your browser settings.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">5. Your Rights (GDPR)</h2>
          <p>If you are based in the European Economic Area, you have the right to access, correct, or delete your personal data at any time. To make a request, email us at info@bodystrands.com.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">6. Data Retention</h2>
          <p>We retain order data for up to 3 years for accounting and legal purposes. You may request deletion at any time outside of legal obligations.</p>
        </section>

        <section>
          <h2 className="font-josefin text-sm tracking-widest uppercase mb-3">7. Contact</h2>
          <p>For any privacy-related questions, contact us at info@bodystrands.com.</p>
        </section>

      </div>
    </div>
  );
}
