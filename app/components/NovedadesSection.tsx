import Image from "next/image";
import Link from "next/link";
import { PageContent } from "@/lib/firebase/contenido-service";

interface NovedadesSectionProps {
  content?: PageContent | null;
}

export default function NovedadesSection({ content }: NovedadesSectionProps) {
  const sections = content?.sections || {};

  return (
    <section className="py-32 md:py-48 bg-[#131313] px-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6">
          <div>
            <span
              className="text-[#ffb4ab] text-xs font-bold tracking-widest uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Drops Semanales
            </span>
            <h2
              className="text-4xl md:text-6xl font-bold mt-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Novedades y Ofertas
            </h2>
          </div>
          <Link
            href="/tienda"
            className="text-[#ffb4ab] font-bold flex items-center gap-3 hover:translate-x-1 transition-transform text-lg"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Explorar Todo{" "}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-10 h-auto md:h-[750px]">
          {/* ── Main Feature Card (2 cols × 2 rows) ── */}
          <div className="md:col-span-2 md:row-span-2 bg-[#1c1b1b] rounded-xl overflow-hidden relative group">
            <Image
              src={
                sections.novCard1Image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAGAKsu8kgkWqhRf2jrHlYwVuMJVv16kBAN6Vz8JEvMFGaGKfAANRpoBEq_JS_Xz3qvVFR9oimA8wb72idjQtqvQ9jnWOTXhPjg_h8Brszs_ByvHAFLeqhcTZOHVHXTzhQUntNze0Y_SdgzbrH0i36eDgYHh-phqevc_1x6kIxtwUVvLAuHIDFbQX6ScSBG2KUNYsaJpVLrD5lb6JPV3Efs5JXXDb6_Ipzy9OeG2OH8xoEQ87HJAhCQIQqAVM1Io1T1XDcC1i2GV0us"
              }
              alt="Stunning 3D printed anime statue of a female warrior with flowing hair and cape"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-12 w-full z-10">
              <div
                className="bg-[#e30617] text-[#fff5f3] text-[10px] font-black py-1.5 px-4 w-fit mb-6 tracking-widest uppercase"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {sections.novCard1Badge || "Edición Limitada"}
              </div>
              <h3
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {sections.novCard1Title || 'Colección "Guerreras del Éter"'}
              </h3>
              <p
                className="text-[#e5e2e1]/70 mb-8 max-w-md text-lg"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {sections.novCard1Desc ||
                  "Nuestras figuras más detalladas hasta la fecha. 15% de descuento en el primer drop."}
              </p>
              <Link href={sections.novCard1BtnLink || "/catalogo"}>
                <button className="bg-primary-container text-white px-8 py-3 font-bold hover:bg-primary-container/80 transition-all active:scale-95 shadow-lg shadow-primary-container/20">
                  {sections.novCard1BtnText || "Aprovechar Oferta"}
                </button>
              </Link>
            </div>
          </div>

          {/* ── Secondary Offer (2 cols × 1 row) ── */}
          <Link
            href={sections.novCard2Link || "/catalogo"}
            className="md:col-span-2 bg-[#2a2a2a] rounded-xl overflow-hidden relative flex flex-col md:flex-row group transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="p-12 flex flex-col justify-center flex-1">
              <span
                className="text-[#ffb4ab] text-[10px] font-bold tracking-tighter mb-2"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {sections.novCard2Badge || "RESTOCK"}
              </span>
              <h3
                className="text-3xl font-bold mb-4"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {sections.novCard2Title || "Héroes Legendarios"}
              </h3>
              <p
                className="text-[#e5e2e1]/60 text-base mb-6"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {sections.novCard2Desc ||
                  "Figuras de acción articuladas impresas en Nylon de alta resistencia."}
              </p>
              <div
                className="text-3xl font-bold text-[#ffb4ab]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {sections.novCard2Price || "S/. 35.00"}{" "}
                {sections.novCard2OldPrice && (
                  <span
                    className="text-sm text-[#e5e2e1]/30 line-through font-normal ml-2"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {sections.novCard2OldPrice}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 h-64 md:h-full overflow-hidden relative">
              <Image
                src={
                  sections.novCard2Image ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyZQu8BF3-WNkKF0EAj4pGyBN-6QV5G9uu3i9VLBB1yRG5rlvfM0qIpXBN0vPli42E74yNktNlvKKep6st68FSSIRLS_qpBUQc0k8Z5SAFC2LEV7Dh6kThFZtjjfZDSTDRvnp4iIY0z0gvprAJM3ttWexvwdOJt5xDj3KxCvCFXLcd1kcXZE4nXP3A8L8n0kQjV6IH1fUv-8OJlFRN9jr6t-415WyzB-bwQheFlDg6qY8w6SkcYNsz28KfK0AVEogOTFjhvlbDfAR0"
                }
                alt="3D printed action figure parts on a workbench"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                unoptimized
              />
            </div>
          </Link>

          {/* ── Painting Service (1 col × 1 row) ── */}
          <div className="bg-[#1c1c1c] rounded-xl p-12 flex flex-col justify-between border border-[#e5e2e1]/5">
            <span
              className="material-symbols-outlined text-[#ffb4ab] text-4xl mb-4"
              style={{ fontSize: "36px" }}
            >
              brush
            </span>
            <div>
              <h4
                className="font-bold text-xl leading-tight mb-3"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Servicio de Pintura
              </h4>
              <p
                className="text-sm text-[#e5e2e1]/50 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Nuestros artistas ahora ofrecen acabados a mano nivel
                profesional para cada pieza única.
              </p>
            </div>
          </div>

          {/* ── Discord Community (1 col × 1 row) ── */}
          <div className="bg-[#e30617] rounded-xl p-12 flex flex-col justify-between group cursor-pointer hover:bg-[#ffb4ab] transition-colors">
            <div className="flex justify-between items-start">
              <span
                className="material-symbols-outlined text-[#fff5f3] text-4xl"
                style={{ fontSize: "36px" }}
              >
                videogame_asset
              </span>
              <span className="material-symbols-outlined text-[#fff5f3] group-hover:rotate-45 transition-transform">
                north_east
              </span>
            </div>
            <div>
              <h4
                className="font-bold text-xl leading-tight text-[#fff5f3] mb-3"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Comunidad Discord
              </h4>
              <p
                className="text-sm text-[#fff5f3]/70 leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Comparte tus fotos y vota por el próximo diseño mensual con
                miles de fans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
