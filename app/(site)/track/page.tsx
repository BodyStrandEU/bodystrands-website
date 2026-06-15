import { Metadata } from "next";
import TrackForm from "@/components/TrackForm";

export const metadata: Metadata = {
  title: "Track Your Order — Bodystrands",
  description: "Enter your tracking number to follow your Bodystrands parcel in real time.",
};

export default function TrackPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col items-center gap-8">

        <div className="text-center">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-4">
            Track Your Order
          </h1>
          <p className="text-[0.75rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed">
            Enter the tracking number from your shipping confirmation email.
          </p>
        </div>

        <TrackForm />

        <div className="text-center space-y-1.5 pt-2">
          <p className="text-[0.65rem] font-light tracking-wide text-[#8C7B6E]">
            Orders ship within 1–2 business days. Delivery takes 4–7 days (EU) or 7–14 days (USA / Canada).
          </p>
          <p className="text-[0.65rem] font-light tracking-wide text-[#8C7B6E]">
            No tracking number yet?{" "}
            <a
              href="mailto:storenavaria@gmail.com"
              className="text-[#A0622A] hover:underline"
            >
              Contact us
            </a>
            {" "}and we&apos;ll help.
          </p>
        </div>

      </div>
    </div>
  );
}
