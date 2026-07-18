import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About — Bodystrands",
  description: "The story behind Bodystrands — handmade body jewelry crafted with love by El & Gio in Portugal.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-20 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Our Story</p>
        <h1 className="font-heading text-5xl md:text-7xl font-light text-[#2C2220]">About Us</h1>
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex-1 max-w-24 h-px bg-[#E8B4A8]/40" />
          <span className="text-[#E8B4A8]/60 text-[0.6rem]">◆</span>
          <div className="flex-1 max-w-24 h-px bg-[#E8B4A8]/40" />
        </div>
      </div>

      {/* Main story */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-20 md:mb-28">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/lifestyle-pearl-back.jpg"
            alt="Bodystrands handmade jewelry"
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="flex flex-col gap-7">
          <h2 className="font-heading text-3xl md:text-5xl font-light text-[#2C2220] leading-snug">
            Hello and welcome.<br />
            <em className="not-italic text-[#A0622A]">We are El &amp; Gio.</em>
          </h2>
          <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
            We are the couple and creators behind Bodystrands — and we are so glad you are here.
          </p>

          <div>
            <p className="text-[0.6rem] tracking-[0.28em] uppercase text-[#A0622A] mb-3">From Canada to Europe</p>
            <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
              The original Bodystrands concept was born and established in Canada. We completely fell in love with the brand&apos;s vision and decided it was time to bring it across the ocean. We are proud to be the official European home of Bodystrands — making these beautiful designs easily accessible to our customers across the EU.
            </p>
          </div>

          <div>
            <p className="text-[0.6rem] tracking-[0.28em] uppercase text-[#A0622A] mb-3">Handmade in Portugal and Canada</p>
            <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
              While the roots of the brand lie in Canada, the heart of Bodystrands EU beats in Portugal. Every single piece in our shop is 100% handmade by the two of us in our Portuguese studio. From the first idea to the final detail, we pour our love, care, and dedication into every strand.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[#2C2220] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#E8B4A8]/60 mb-14 text-center">What you can expect from us</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16">
            {[
              {
                title: "Handmade with Love",
                body: "No mass production. Just genuine, slow-crafted artisanal jewelry made by El and Gio — by hand, every single piece.",
              },
              {
                title: "The European Home",
                body: "Bringing the Canadian favourite to Europe means faster shipping and zero customs hassle for our EU customers.",
              },
              {
                title: "High Quality",
                body: "High-quality stainless steel — tarnish-resistant, waterproof, and built to be worn every single day.",
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

      {/* Closing */}
      <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
        <p className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] leading-relaxed mb-6">
          &ldquo;When you shop with us, you are supporting a small, passionate couple-run business. We are so thrilled to share our craft with you.&rdquo;
        </p>
        <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#A0622A] mb-12">— El &amp; Gio</p>
        <Link href="/shop" className="btn-primary-filled">
          Shop the Collection
        </Link>
      </div>

    </div>
  );
}
