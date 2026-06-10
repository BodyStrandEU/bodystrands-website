"use client";

const reviews = [
  { name: "Jovana", text: "Beautiful body chain! Came in nice packaging and looks exactly as described. I love wearing mine over a thin cashmere shirt—it adds such a classy touch." },
  { name: "Johanna", text: "Loved the necklace and the cute note with the package. It was packaged nicely and arrived on the expected date." },
  { name: "Yesim", text: "The necklace looks even more beautiful and higher quality in real life than described!" },
  { name: "Ferdose", text: "Item arrived on time and looked like the image. It also seems durable, and I'm not afraid of it snapping easily, which I appreciate." },
  { name: "Krystal", text: "Beautiful body chain and good quality! It came in a sturdy storage box that will ensure it's kept well when it's not being worn." },
  { name: "Miranda", text: "Great quality and the seller is great with communication and fast shipping!" },
  { name: "Yesim", text: "A great accessory for crop tops. Feels very comfortable against the skin." },
  { name: "Tomislav", text: "Very good quality, very good customer service! I am very satisfied!" },
];

function StarRow() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-[#A0622A] text-[0.65rem]">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <div className="flex-shrink-0 w-80 px-6 flex flex-col">
      <StarRow />
      <p className="text-[0.8rem] font-light leading-relaxed tracking-wide text-[#2C2220] italic flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <p className="text-[0.58rem] tracking-[0.22em] uppercase text-[#8C7B6E] mt-4">
        — {name}
      </p>
    </div>
  );
}

export default function ReviewsMarquee() {
  const doubled = [...reviews, ...reviews];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-14 text-center">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#A0622A] mb-3">Real Reviews</p>
        <h2 className="font-heading text-4xl md:text-5xl font-light text-[#2C2220]">
          Worn &amp; Loved
        </h2>
      </div>

      <div className="overflow-hidden">
        <div className="flex marquee-track">
          {doubled.map((review, i) => (
            <ReviewCard key={i} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
