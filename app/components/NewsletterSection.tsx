"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to newsletter service
    setSubmitted(true);
  }

  return (
    <section className="py-32 md:py-48 px-12 bg-[#131313]">
      <div className="container mx-auto max-w-5xl bg-[#2a2a2a] rounded-3xl p-16 md:p-24 relative overflow-hidden text-center">
        {/* Glow blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffb4ab]/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />

        <h2
          className="text-5xl font-bold mb-6 relative z-10"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Únete al Gremio
        </h2>

        <p
          className="text-[#e5e2e1]/60 mb-12 max-w-xl mx-auto relative z-10 text-lg"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Suscríbete para acceso anticipado a drops de edición limitada, guías
          de pintura y noticias exclusivas del estudio.
        </p>

        {submitted ? (
          <div className="relative z-10 flex flex-col items-center gap-4">
            <span
              className="material-symbols-outlined text-[#ffb4ab]"
              style={{ fontSize: "48px" }}
            >
              check_circle
            </span>
            <p
              className="text-lg font-bold text-[#e5e2e1]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              ¡Bienvenido al Gremio!
            </p>
            <p
              className="text-sm text-[#e5e2e1]/50"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Recibirás noticias exclusivas en {email}.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-6 max-w-lg mx-auto relative z-10"
          >
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="flex-1 bg-[#353535] border-0 rounded-md px-8 py-5 focus:ring-1 focus:ring-[#ffb4ab]/50 outline-none text-[#e5e2e1] text-base"
              style={{ fontFamily: "var(--font-inter)" }}
            />
            <button
              type="submit"
              className="bg-[#e30617] text-white font-bold px-10 py-5 rounded-md hover:brightness-110 active:scale-95 transition-all text-base shadow-lg shadow-[#e30617]/20"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Unirse
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
