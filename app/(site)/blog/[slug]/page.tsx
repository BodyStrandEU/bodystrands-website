import { notFound } from "next/navigation";
import Link from "next/link";
import blogPosts from "@/data/blog-posts.json";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Bodystrands Journal`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

type ContentBlock = { type: "paragraph" | "heading"; text: string };
type FaqItem = { question: string; answer: string };

// Older posts stored `content` as a flat string[] (one <p> per entry, no subheadings).
// Newer posts use ContentBlock[] with "heading" blocks mixed in for scannability and
// AEO structure. Normalize both to ContentBlock[] so the renderer only handles one shape.
function normalizeContent(content: unknown): ContentBlock[] {
  if (!Array.isArray(content)) return [];
  if (content.length > 0 && typeof content[0] === "string") {
    return (content as string[]).map((text) => ({ type: "paragraph" as const, text }));
  }
  return content as ContentBlock[];
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const blocks: ContentBlock[] = normalizeContent(post.content);
  const faq: FaqItem[] = Array.isArray((post as { faq?: FaqItem[] }).faq) ? (post as { faq?: FaqItem[] }).faq! : [];

  // Related posts — same category weighted heavily, shared tags add relevance,
  // recency only breaks ties. Previously this just showed the 3 most recent
  // posts regardless of topic, which meant e.g. a Care & Quality post could
  // link out to 3 unrelated Style Guide posts.
  const allPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const related = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: (p.category === post.category ? 10 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
    .slice(0, 3)
    .map((s) => s.post);

  return (
    <div className="pt-32 pb-24">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-10">
        <Link href="/blog" className="flex items-center gap-2 text-[0.58rem] tracking-[0.2em] uppercase text-[#8C7B6E] hover:text-[#A0622A] transition-colors">
          <span>←</span> Journal
        </Link>
      </div>

      {/* Post header */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-12">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[0.52rem] tracking-[0.28em] uppercase text-[#A0622A]">{post.category}</span>
          <span className="text-[#E8B4A8]/40">·</span>
          <span className="text-[0.52rem] tracking-[0.15em] text-[#8C7B6E]">{post.readTime}</span>
          <span className="text-[#E8B4A8]/40">·</span>
          <span className="text-[0.52rem] tracking-[0.15em] text-[#8C7B6E]">
            {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-light text-[#2C2220] leading-snug mb-6">
          {post.title}
        </h1>
        <p className="text-base font-light leading-loose tracking-wide text-[#8C7B6E]">
          {post.excerpt}
        </p>
        <div className="mt-8 h-px bg-[#E8B4A8]/30" />
      </div>

      {/* Post body */}
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-16">
        <div className="flex flex-col gap-6 blog-content">
          {blocks.map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] mt-4">
                {block.text}
              </h2>
            ) : (
              <p key={i} className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80"
                dangerouslySetInnerHTML={{ __html: block.text }}
              />
            )
          )}
        </div>

        {/* FAQ — direct question/answer pairs, self-contained so they can be pulled into
            AI answer boxes and zero-click search results on their own (see matching
            FAQPage JSON-LD below). */}
        {faq.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#E8B4A8]/30">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-6">Frequently Asked Questions</p>
            <div className="flex flex-col gap-6">
              {faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-heading text-lg font-light text-[#2C2220] mb-2">{item.question}</h3>
                  <p className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[0.5rem] tracking-[0.18em] uppercase text-[#8C7B6E] border border-[#E8B4A8]/40 px-3 py-1.5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            }),
          }}
        />
      )}

      {/* CTA */}
      <div className="bg-[#2C2220] py-16 md:py-20 mb-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#E8B4A8]/60 mb-5">Handmade in Portugal</p>
          <p className="font-heading text-3xl md:text-4xl font-light text-[#E8B4A8] mb-8">
            Explore the Collection
          </p>
          <Link href="/shop" className="btn-primary-filled">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-10 text-center">More from the Journal</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col gap-3">
                <span className="text-[0.52rem] tracking-[0.28em] uppercase text-[#A0622A]">{p.category}</span>
                <div className="border-t border-[#E8B4A8]/30 pt-4">
                  <h3 className="font-heading text-xl font-light text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors">
                    {p.title}
                  </h3>
                </div>
                <span className="text-[0.58rem] tracking-[0.2em] uppercase text-[#A0622A] group-hover:underline underline-offset-4">Read →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
