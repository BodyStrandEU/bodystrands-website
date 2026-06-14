export const metadata = {
  title: "Contact — Bodystrands",
  description: "Get in touch with Bodystrands. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[#A0622A] mb-4">Get in Touch</p>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-[#2C2220]">Contact</h1>
          <div className="mt-6 w-px h-12 bg-[#A0622A]/30 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-4xl mx-auto">

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A] mb-3">Email</p>
              <a
                href="mailto:storenavaria@gmail.com"
                className="text-sm font-light text-[#2C2220] hover:text-[#A0622A] transition-colors tracking-wide"
              >
                storenavaria@gmail.com
              </a>
            </div>

            <div>
              <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A] mb-3">Response Time</p>
              <p className="text-sm font-light text-[#8C7B6E] tracking-wide">
                We respond within 24 hours, guaranteed.
              </p>
            </div>

            <div className="h-px bg-[#E8B4A8]/30" />

            <p className="text-xs font-light leading-loose tracking-wide text-[#8C7B6E]">
              Have a question about an order, a custom request, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Name</label>
              <input
                type="text"
                name="name"
                required
                className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors"
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Email</label>
              <input
                type="email"
                name="email"
                required
                className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button type="submit" className="btn-primary-filled w-full py-4">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
