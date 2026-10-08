import { blogSeo } from "@/lib/seo-overrides";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import blogPosts from "@/data/blog-posts.json";
import { products } from "@/lib/products";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  const image = postImage(post);
  const seo = blogSeo(slug);
  return {
    // Short brand suffix: " — Bodystrands Journal" pushed 111 of 117 titles past the ~60
    // characters Google shows, so the end of the post title was being cut off.
    title: seo?.title ?? `${post.title} | Bodystrands`,
    description: seo?.description ?? post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      publishedTime: post.date,
      authors: ["El & Gio"],
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

// Posts carry no hero image of their own; the first featured product's photo is
// the most relevant image for social previews and article rich results. Resolved
// against the live catalog and limited to photos hosted on bodystrands.com — older
// posts stored Etsy CDN URLs, which put Etsy-hosted images in previews.
function postImage(post: (typeof blogPosts)[number]): string | null {
  const featured = (post as { featuredProducts?: { id: string }[] }).featuredProducts ?? [];
  for (const f of featured) {
    const product = products.find((p) => p.id === f.id && p.active !== false);
    const local = [...(product?.images ?? []), ...((product as { gallery?: string[] } | undefined)?.gallery ?? [])]
      .find((src) => src.startsWith("/images/"));
    if (local) return local;
  }
  return null;
}

// The people behind the brand — articles by real makers carry more weight with
// Google than ones attributed to a company name.
const AUTHOR = { "@type": "Person", name: "El & Gio", url: "https://www.bodystrands.com/about" } as const;

type ContentBlock =
  | { type: "paragraph" | "heading"; text: string }
  | { type: "list"; text?: string; items: string[] };
type FaqItem = { question: string; answer: string };

// Older posts stored `content` as a flat string[] (one <p> per entry, no subheadings).
// Newer posts use ContentBlock[] with "heading" blocks mixed in for scannability and
// AEO structure. Normalize both to ContentBlock[] so the renderer only handles one shape.
function normalizeContent(content: unknown): ContentBlock[] {
  if (!Array.isArray(content)) return [];
  if (content.length > 0 && typeof content[0] === "string") {
    return (content as string[]).map((text) => ({ type: "paragraph" as const, text }));
  }
  return (content as ContentBlock[]).map((b) =>
    b.type === "list" ? b : { type: b.type, text: b.text }
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const blocks: ContentBlock[] = normalizeContent(post.content);

  // Featured products, resolved against the live catalog (names, prices and photos
  // change after a post is written; inactive products are dropped).
  const featured = ((post as { featuredProducts?: { id: string }[] }).featuredProducts ?? [])
    .map((f) => products.find((p) => p.id === f.id && p.active !== false && p.images?.length))
    .filter((p): p is (typeof products)[number] => !!p)
    .slice(0, 4);
  const featuredCategories = [...new Set(featured.map((p) => p.category))];
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <span className="text-[0.52rem] tracking-[0.28em] uppercase text-[#A0622A]">{post.category}</span>
          <span className="text-[#E8B4A8]/40">·</span>
          <Link href="/about" className="text-[0.52rem] tracking-[0.15em] text-[#8C7B6E] hover:text-[#A0622A]">By El &amp; Gio</Link>
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
            block.type === "list" ? (
              <div key={i}>
                {block.text && (
                  <p className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80 mb-3"
                    dangerouslySetInnerHTML={{ __html: block.text }}
                  />
                )}
                <ul className="list-disc pl-5 flex flex-col gap-2 marker:text-[#A0622A]">
                  {block.items.map((item, j) => (
                    <li key={j} className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            ) : block.type === "heading" ? (
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

        {/* Shop the pieces — every post links to real products and their category pages */}
        {featured.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#E8B4A8]/30">
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-6">Shop the Pieces</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EDE8]">
                    <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 768px) 50vw, 180px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <span className="text-xs font-light text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors">{p.name}</span>
                  <span className="text-[0.65rem] tracking-wide text-[#8C7B6E]">€{p.price}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {featuredCategories.map((c) => (
                <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="text-[0.6rem] tracking-[0.2em] uppercase text-[#A0622A] hover:underline underline-offset-4">
                  Shop all {c} →
                </Link>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            mainEntityOfPage: `https://www.bodystrands.com/blog/${slug}`,
            ...(postImage(post) ? { image: new URL(postImage(post)!, "https://www.bodystrands.com").href } : {}),
            author: AUTHOR,
            publisher: { "@type": "Organization", name: "Bodystrands", url: "https://www.bodystrands.com" },
          }),
        }}
      />

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
