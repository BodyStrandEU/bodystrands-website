import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About — Body Strands",
  description: "The story behind Body Strands — handmade body jewellery crafted with love.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-20 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Our Story</p>
        <h1 className="font-heading text-5xl md:text-7xl font-light text-[#2C2220]">About</h1>
        <div className="mt-6 w-px h-12 bg-[#A0622A]/30 mx-auto" />
      </div>

      {/* Story section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <div className="bg-[#F2DDD7] aspect-[4/5] flex items-center justify-center">
          <Image
            src="/images/logo-pink.png"
            alt="Body Strands"
            width={320}
            height={320}
            className="w-2/3 h-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] leading-snug">
            Made by hand.<br />
            <em className="not-italic text-[#A0622A]">Made with intention.</em>
          </h2>
          <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
            Body Strands was born from a love of minimal, wearable art. We believe that jewellery should feel like a second skin — effortless, beautiful, and always with you.
          </p>
          <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
            Every piece in our collection is carefully handcrafted using premium stainless steel. We chose this material deliberately — it resists tarnish, withstands water, and lasts a lifetime without losing its beauty.
          </p>
          <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
            From delicate back chains for weddings to everyday waist chains and anklets, each piece is designed to move with your body and complement your most natural self.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[#2C2220] py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#E8B4A8]/60 mb-12 text-center">What we stand for</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {[
              {
                title: "Handmade",
                body: "Every piece is crafted by hand. No mass production. No shortcuts. Just careful, intentional work.",
              },
              {
                title: "Quality Materials",
                body: "Premium stainless steel means your jewellery stays beautiful. Tarnish-resistant and water-resistant for real life.",
              },
              {
                title: "Minimal Design",
                body: "We design for the woman who wants to feel adorned, not overdone. Dainty pieces that whisper, not shout.",
              },
            ].map((value) => (
              <div key={value.title} className="flex flex-col gap-4">
                <div className="w-8 h-px bg-[#A0622A]" />
                <h3 className="font-heading text-2xl font-light text-[#E8B4A8]">{value.title}</h3>
                <p className="text-xs font-light leading-loose tracking-wide text-[#E8B4A8]/60">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220] mb-6">
          Ready to find your piece?
        </h2>
        <p className="text-sm font-light text-[#8C7B6E] tracking-wide mb-10">
          Browse our full collection of handmade body chains, waist chains, and anklets.
        </p>
        <Link href="/shop" className="btn-primary-filled">
          Shop the Collection
        </Link>
      </div>
    </div>
  );
}
