import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "0.02mm", label: "Detalle" },
  { value: "8K", label: "Resin Core" },
  { value: "MUSEO", label: "Acabado" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-32 overflow-hidden bg-[#0e0e0e]">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[#131313]/80 to-transparent z-10" />
        <div
          className="w-full h-full bg-cover bg-center opacity-40 scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1627672152865-f485989d97a9?q=80&w=2000')",
          }}
          aria-label="Macro shot of a detailed anime figure face"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left column */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#2a2a2a] px-4 py-1.5 w-fit border-l-2 border-[#e30617]">
            <span
              className="text-[10px] font-black tracking-widest uppercase text-[#ffb4ab]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Coleccionables Premium
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter text-[#e5e2e1] uppercase"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Impresión 3D <br />
            <span className="text-gradient-primary">y Modelado.</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-lg md:text-xl text-[#e5e2e1]/60 max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Studio 3D: Especialistas en impresión 3D, modelado digital y diseño personalizado. Creamos desde maquetas y prototipos hasta personajes y piezas mecánicas de alta calidad.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-6 pt-6">
            <Link href="/catalogo">
              <button className="bg-primary-container text-white px-10 py-5 rounded-md font-bold text-lg hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary-container/20">
                Ver Tienda
              </button>
            </Link>
            <Link href="/catalogo">
              <button className="border border-[#af8782]/20 text-[#e5e2e1] px-10 py-5 rounded-md font-medium hover:bg-[#2a2a2a] transition-all">
                Ver Catálogo
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-12 pt-12 opacity-40">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — Feature card */}
        <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
          <div className="relative w-full aspect-[4/5] bg-[#1c1b1b] rounded-xl overflow-hidden shadow-2xl group">
            {/* Color overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffb4ab]/10 to-transparent z-10" />

            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApkZSm91wWoQ6FevP9m2lcTeW3LW5NzuSUhv4WAO5hkZ4zqzqcsiFYi8IO3gpyOn8ZpTf3G_tEzlQKT3vvvVjG7TnYWMGKdxU6lTo9LlZtYEdGQyty-KZ5nrQ-Z58oVU0lvn17gmuDeak-RCDJoMjiVFxxrvepj-fgkQvT4wcEeo0qrtM_XkagjIWkk7hwRYhagk1wWFd1-lXtiTF4cdTtA-8cQcIHKqXlIfZIcEPmBZ3Lca6jyXx0jBcaTbyECnlobm7jmvGUcvWM"
              alt="High quality 3D printed resin figure of a mecha robot with sharp glowing red edges"
              fill
              className="object-cover mix-blend-overlay opacity-80 transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />

            {/* Info overlay */}
            <div
              className="absolute bottom-8 left-8 right-8 p-8 border-l-2 border-[#e30617] rounded-sm z-20"
              style={{
                background: "rgba(19, 19, 19, 0.6)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <h3
                className="font-bold text-xl mb-1"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Mecha-X Prototype
              </h3>
              <p
                className="text-xs text-[#e5e2e1]/50"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                MATERIAL: TOUGH RESIN / DETALLE: 20 MICRAS
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
