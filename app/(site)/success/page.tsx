import Link from "next/link";

export const metadata = {
  title: "Order Confirmed — Bodystrands",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F7] px-6">
      <div className="text-center max-w-md">

        <div className="w-12 h-12 rounded-full bg-[#E8B4A8]/40 flex items-center justify-center mx-auto mb-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0622A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Order Confirmed</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-6">
          Thank you for your order
        </h1>
        <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-10">
          Your handmade piece is being prepared with care. You&apos;ll receive a confirmation
          email shortly — including a tracking number once your order ships.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/shop" className="btn-primary-filled text-center">
            Continue Shopping
          </Link>
          <Link href="/track" className="btn-primary text-center">
            Track Order
          </Link>
        </div>

        <div className="border-t border-[#E8B4A8]/30 pt-8">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#8C7B6E] mb-3">
            Follow our journey
          </p>
          <a
            href="https://www.instagram.com/bodystrands/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.15em] uppercase text-[#A0622A] hover:text-[#8A5222] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            @bodystrands
          </a>
        </div>

      </div>
    </div>
  );
}
