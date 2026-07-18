"use client";
import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real visitors never see or fill this
  const [status,  setStatus]  = useState<Status>("idle");
  const [errMsg,  setErrMsg]  = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, message, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        setName(""); setEmail(""); setMessage("");
      }
    } catch {
      setErrMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <div className="w-8 h-px bg-[#A0622A]" />
        <h3 className="font-heading text-2xl font-light text-[#2C2220]">Message sent.</h3>
        <p className="text-sm font-light leading-loose tracking-wide text-[#8C7B6E]">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-[0.6rem] tracking-[0.25em] uppercase text-[#A0622A] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
      {/* Honeypot — hidden from real visitors via off-screen positioning (not display:none,
          which some bots know to skip), left empty by anyone who can't see it */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === "loading"}
          className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors disabled:opacity-50"
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
          className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors disabled:opacity-50"
          placeholder="your@email.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[0.55rem] tracking-[0.25em] uppercase text-[#8C7B6E]">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          disabled={status === "loading"}
          className="px-4 py-3 text-xs tracking-wide font-light border border-[#A0622A]/20 bg-transparent text-[#2C2220] placeholder-[#8C7B6E]/50 outline-none focus:border-[#A0622A] transition-colors resize-none disabled:opacity-50"
          placeholder="How can we help you?"
        />
      </div>

      {status === "error" && (
        <p className="text-[0.65rem] tracking-wide text-red-400">{errMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary-filled w-full py-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
