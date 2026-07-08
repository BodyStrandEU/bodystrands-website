import ContactForm from "@/components/ContactForm";

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
                href="mailto:info@bodystrands.com"
                className="text-sm font-light text-[#2C2220] hover:text-[#A0622A] transition-colors tracking-wide"
              >
                info@bodystrands.com
              </a>
            </div>

            <div>
              <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[#A0622A] mb-3">WhatsApp</p>
              <a
                href="https://wa.me/351935483918?text=Hi!%20I%20have%20a%20question%20about%20a%20Bodystrands%20piece."
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-light text-[#2C2220] hover:text-[#A0622A] transition-colors tracking-wide"
              >
                +351 935 483 918
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
              Have a question about an order, a custom request, or just want to say hello? We&apos;d love to hear from you.
            </p>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
