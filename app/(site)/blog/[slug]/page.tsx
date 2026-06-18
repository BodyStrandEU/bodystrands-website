import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "@/components/SmartImage";
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
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const allPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

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
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-sm font-light leading-loose tracking-wide text-[#2C2220]/80"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[0.5rem] tracking-[0.18em] uppercase text-[#8C7B6E] border border-[#E8B4A8]/40 px-3 py-1.5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Shop This Post */}
      {"featuredProducts" in post && Array.isArray((post as {featuredProducts?: unknown[]}).featuredProducts) && (post as {featuredProducts: {id: string; name: string; price: string; image: string; url: string}[]}).featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-20">
          <div className="flex items-center gap-6 mb-10">
            <div className="flex-1 h-px bg-[#E8B4A8]/30" />
            <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] whitespace-nowrap">Shop This Post</p>
            <div className="flex-1 h-px bg-[#E8B4A8]/30" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(post as {featuredProducts: {id: string; name: string; price: string; image: string; url: string}[]}).featuredProducts.map((product) => (
              <Link key={product.id} href={product.url} className="group flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden bg-[#F5EFE9]">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[0.65rem] font-light tracking-wide text-[#2C2220] group-hover:text-[#A0622A] transition-colors leading-snug">{product.name}</p>
                  <p className="text-[0.6rem] tracking-[0.1em] text-[#A0622A]">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
