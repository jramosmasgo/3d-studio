import { PageContent } from "@/lib/firebase/contenido-service";

interface TestimoniosSectionProps {
  content?: PageContent | null;
}

export default function TestimoniosSection({ content }: TestimoniosSectionProps) {
  const sections = content?.sections || {};

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const testimonials = [
    {
      name: sections.test1Name || "Carlos Mendoza",
      role: sections.test1Role || "Coleccionista de Miniaturas",
      quote:
        sections.test1Quote ||
        "La precisión en el detalle de las miniaturas es de otro mundo. He pedido varias figuras en resina y la calidad de la superficie es impecable, casi sin líneas de capa.",
      stars: 5,
      initials: getInitials(sections.test1Name || "Carlos Mendoza"),
      gradient: "from-[#ffb4ab]/20 to-[#af8782]/20",
    },
    {
      name: sections.test2Name || "Ana Gómez",
      role: sections.test2Role || "Diseñadora Industrial",
      quote:
        sections.test2Quote ||
        "Excelente servicio de prototipado rápido. Nos ayudaron a validar una pieza mecánica compleja en Fusion 360 y la impresión final en filamento resistió perfectamente las pruebas.",
      stars: 5,
      initials: getInitials(sections.test2Name || "Ana Gómez"),
      gradient: "from-[#af8782]/20 to-red-950/20",
    },
    {
      name: sections.test3Name || "Roberto Silva",
      role: sections.test3Role || "Arquitecto",
      quote:
        sections.test3Quote ||
        "Imprimimos la maqueta de un proyecto de condominios completo. El nivel de detalle en las estructuras y la rapidez en la entrega superaron nuestras expectativas.",
      stars: 5,
      initials: getInitials(sections.test3Name || "Roberto Silva"),
      gradient: "from-red-950/20 to-[#ffb4ab]/20",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#0e0e0e] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#ffb4ab]/3 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <span
            className="text-[#ffb4ab] text-xs font-bold tracking-widest uppercase"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {sections.testSubtitle || "Testimonios"}
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mt-4 leading-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {sections.testTitle || "Voces del Gremio"}
          </h2>
          <p
            className="text-[#e5e2e1]/60 mt-4 max-w-xl mx-auto text-base"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {sections.testDesc ||
              "Descubre la experiencia de creadores, diseñadores y profesionales que confían en nuestro estudio para dar vida a sus ideas."}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] border border-[#af8782]/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between hover:border-[#ffb4ab]/30 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[#ffb4ab] text-xl">
                      star
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-[#e5e2e1]/80 text-base leading-relaxed italic mb-8"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  &quot;{t.quote}&quot;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 border-t border-[#af8782]/10 pt-6">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${t.gradient} border border-[#af8782]/20 flex items-center justify-center font-bold text-[#ffb4ab] text-sm shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <h4
                    className="font-bold text-[#e5e2e1] group-hover:text-[#ffb4ab] transition-colors"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {t.name}
                  </h4>
                  <p className="text-xs text-[#e5e2e1]/50" style={{ fontFamily: "var(--font-inter)" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
