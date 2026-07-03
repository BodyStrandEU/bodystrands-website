import Link from "next/link";
import blogPosts from "@/data/blog-posts.json";

export const metadata = {
  title: "Journal — Bodystrands",
  description: "Style guides, jewelry care tips, and inspiration from the Bodystrands studio in Portugal.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="pt-32 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-16 md:mb-20 text-center">
        <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">From the Studio</p>
        <h1 className="font-heading text-5xl md:text-7xl font-light text-[#2C2220]">Journal</h1>
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex-1 max-w-24 h-px bg-[#E8B4A8]/40" />
          <span className="text-[#E8B4A8]/60 text-[0.6rem]">◆</span>
          <div className="flex-1 max-w-24 h-px bg-[#E8B4A8]/40" />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-12">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.52rem] tracking-[0.28em] uppercase text-[#A0622A]">{post.category}</span>
                <span className="text-[0.52rem] tracking-[0.15em] text-[#8C7B6E]">{post.readTime}</span>
              </div>
              <div className="border-t border-[#E8B4A8]/30 pt-5">
                <h2 className="font-heading text-2xl md:text-3xl font-light text-[#2C2220] leading-snug group-hover:text-[#A0622A] transition-colors duration-200 mb-3">
                  {post.title}
                </h2>
                <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E] line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-2">
                <span className="text-[0.58rem] tracking-[0.2em] uppercase text-[#A0622A] group-hover:underline underline-offset-4">
                  Read More
                </span>
                <span className="text-[#A0622A] text-[0.6rem] group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
              <div className="text-[0.5rem] tracking-[0.15em] text-[#8C7B6E]/60">
                {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
