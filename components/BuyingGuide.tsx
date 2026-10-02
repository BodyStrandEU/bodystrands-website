import type { CategoryContent } from "@/lib/category-content";

// Buying guide + FAQ block (with FAQPage structured data) shared by category pages
// (/shop?category=…), /gifts and /christmas. Paragraph and list text may contain
// <a href="/shop/…"> links authored in lib/category-content.ts / lib/gift-content.ts.
export default function BuyingGuide({ label, content }: { label: string; content: CategoryContent }) {
  return (
    <section className="mt-20 md:mt-28 max-w-3xl mx-auto px-4 md:px-0">
      <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-6">{label}</p>
      <div className="flex flex-col gap-5 blog-content">
        {content.guide.map((block, i) =>
          block.type === "heading" ? (
            <h2 key={i} className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] mt-4">{block.text}</h2>
          ) : block.type === "list" ? (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-2 marker:text-[#A0622A]">
              {block.items.map((item, j) => (
                <li key={j} className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          ) : (
            <p key={i} className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80" dangerouslySetInnerHTML={{ __html: block.text }} />
          )
        )}
      </div>

      <div className="mt-14 pt-10 border-t border-[#E8B4A8]/30">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-6">Frequently Asked Questions</p>
        <div className="flex flex-col gap-6">
          {content.faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-heading text-lg font-light text-[#2C2220] mb-2">{item.question}</h3>
              <p className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: content.faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
    </section>
  );
}
