export type FaqItem = { question: string; answer: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-[#E8B4A8]/40 border-t border-b border-[#E8B4A8]/40">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
            <span className="font-josefin text-sm md:text-[0.95rem] tracking-wide text-[#2C2220]">
              {item.question}
            </span>
            <span className="flex-shrink-0 text-[#A0622A] text-lg font-light transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-4 font-cormorant text-lg leading-relaxed text-[#8C7B6E] max-w-2xl">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
