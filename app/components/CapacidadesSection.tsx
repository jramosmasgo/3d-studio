import Image from "next/image";

const capabilities = [
  {
    number: "01",
    title: "Modelado Digital Pro",
    description:
      "Asesoría y desarrollo en Fusion 360, Blender y AutoCAD. Convertimos ideas complejas en soluciones funcionales para ingeniería y arquitectura.",
  },
  {
    number: "02",
    title: "Prototipado Técnico",
    description:
      "Desarrollamos piezas mecánicas, maquetas y prototipos industriales con precisión milimétrica en resina y filamento.",
  },
  {
    number: "03",
    title: "Personajes y Arte",
    description:
      "Creación de personajes y figuras animadas con acabados de alta calidad, fusionando arte digital con fabricación aditiva de vanguardia.",
  },
];

export default function CapacidadesSection() {
  return (
    <section className="py-32 md:py-48 bg-[#0e0e0e] overflow-hidden relative">
      <div className="container mx-auto px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          {/* ── Left: Text + Capabilities List ── */}
          <div className="lg:col-span-5 space-y-16">
            {/* Section header */}
            <div>
              <span
                className="text-[#ffb4ab] text-xs font-bold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Nuestras Capacidades
              </span>
              <h2
                className="text-5xl md:text-6xl font-bold mt-6 leading-tight"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Calidad Visual <br /> Industrial
              </h2>
            </div>

            {/* Capability items */}
            <div className="space-y-14 relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-[1px] bg-[#af8782]/20" />

              {capabilities.map((cap) => (
                <div key={cap.number} className="relative pl-16">
                  {/* Number badge */}
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#af8782]/20 flex items-center justify-center z-10">
                    <span
                      className="text-xs font-black text-[#ffb4ab]"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {cap.number}
                    </span>
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {cap.title}
                  </h3>
                  <p
                    className="text-[#e5e2e1]/60 text-base leading-relaxed"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Image + Floating Elements ── */}
          <div className="lg:col-span-7 relative">
            {/* Main image */}
            <div className="aspect-video bg-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhy9-w6HrqR803Cd70xkrMWZo58Kjl9AvxBTemcDqgKGM7GcVDmprcCfcQrYg68fU6NmEpNMYtupw2QUOkzmz-itrUMrQNzheo8jrCLhSPG4k_J-i62LoU9O-kt4UAI1Ej2CR-xWCTgpKavpHFGyjT1gZlNcpTRdueu5jcCu3eVBylowEaU0cUUz3tUrXVRAPuMue_ralMBxD-ZC3Yfty4Bq27ruv-qGuKhiXXoK7U_nDtt80rKDFG3jVTkfeGtpYV3VFxnj7BD7AH"
                alt="Close up of a resin 3D printer bed lifting a highly detailed monster figure"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors duration-500" />

              {/* Floating print status */}
              <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md p-6 border-l-2 border-[#ffb4ab]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] animate-pulse" />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Imprimiendo: Bust_Vader_1_4
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    { label: "Avance:", value: "87%" },
                    { label: "Eje Z:", value: "0.02mm" },
                    { label: "Resina:", value: "Gray-HD" },
                  ].map((row) => (
                    <>
                      <span
                        key={row.label + "-label"}
                        className="text-[9px] text-white/40 uppercase"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {row.label}
                      </span>
                      <span
                        key={row.label + "-value"}
                        className="text-[9px] text-white font-bold"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {row.value}
                      </span>
                    </>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating quality badge */}
            <div className="absolute -bottom-12 -left-12 w-64 bg-[#131313] rounded-xl p-10 shadow-2xl hidden md:block border-t border-[#af8782]/10">
              <span
                className="material-symbols-outlined text-[#ffb4ab] mb-6 block"
                style={{ fontSize: "28px" }}
              >
                verified
              </span>
              <h4
                className="font-bold text-lg mb-2"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Calidad Colección
              </h4>
              <p
                className="text-xs text-[#e5e2e1]/50 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Inspección de 12 puntos antes del envío para asegurar la
                perfección total.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
