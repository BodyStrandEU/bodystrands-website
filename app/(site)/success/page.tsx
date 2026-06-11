import Link from "next/link";

export const metadata = {
  title: "Order Confirmed — Bodystrands",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F7] px-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-[#E8B4A8]/40 flex items-center justify-center mx-auto mb-8">
          <div className="w-5 h-5 border-2 border-[#A0622A] rounded-full" />
        </div>
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Order Confirmed</p>
        <h1 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-6">
          Thank you for your order
        </h1>
        <p className="text-sm font-light leading-relaxed tracking-wide text-[#8C7B6E] mb-10">
          Your handmade piece is on its way. You'll receive a confirmation email shortly with your order details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="btn-primary-filled text-center">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-primary text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
