import { Metadata } from "next";
import { verifyReviewToken } from "@/lib/reviewToken";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";

export const metadata: Metadata = {
  title: "Leave a Review — Bodystrands",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = verifyReviewToken(token);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-3">Bodystrands</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light tracking-wide text-[#2C2220] mb-4">
            {payload ? "Leave a Review" : "Link Expired"}
          </h1>
          {payload ? (
            <p className="text-[0.75rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed">
              Tell us about your <strong className="text-[#2C2220]">{payload.productName}</strong>. A photo isn&apos;t required, but it helps other shoppers see it in real life.
            </p>
          ) : (
            <p className="text-[0.75rem] font-light tracking-wide text-[#8C7B6E] leading-relaxed">
              This review link is invalid or has expired. Reach out to{" "}
              <a href="mailto:info@bodystrands.com" className="text-[#A0622A] hover:underline">info@bodystrands.com</a>{" "}
              and we&apos;ll help.
            </p>
          )}
        </div>

        {payload && <ReviewSubmitForm token={token} />}
      </div>
    </div>
  );
}
