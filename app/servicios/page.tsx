"use client";

import { useState, useEffect } from "react";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/Footer";
import Image from "next/image";
import { getPageContent, type PageContent } from "@/lib/firebase/contenido-service";

export default function ServiciosPage() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getPageContent("servicios");
        setContent(data);
      } catch (error) {
        console.error("Error loading services content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface/60 font-body text-sm">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  // Robust helper to ensure we never render an empty, null, or invalid string image URL
  const getValidImage = (url: any, fallback: string) => {
    if (!url || typeof url !== "string" || url.trim() === "" || url === "undefined" || url === "null") {
      return fallback;
    }
    return url;
  };

  // Construct dynamic services array with full Firebase mapping and fallbacks
  const services = [
    {
      id: "diseno-3d",
      title: content?.sections?.disenoTitle || "Diseño y Escultura Digital 3D",
      tag: "Concepto a 3D",
      description: content?.sections?.disenoDescription || "Convertimos tus bosquejos, ideas o conceptos bidimensionales en modelos tridimensionales listos para impresión. Diseñamos desde personajes y criaturas detalladas hasta piezas mecánicas de precisión técnica utilizando Fusion 360, Blender y AutoCAD.",
      features: [
        "Escultura orgánica y orgánica-mecánica",
        "Modelado paramétrico y piezas funcionales",
        "Optimización de mallas y preparación STL/OBJ",
        "Corrección de archivos y cortes para ensamblaje"
      ],
      image: getValidImage(content?.sections?.disenoImage, "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=2070"),
      icon: "architecture"
    },
    {
      id: "pintura-acabado",
      title: content?.sections?.pinturaTitle || "Servicio de Pintura y Acabado Artístico",
      tag: "Calidad de Exhibición",
      description: content?.sections?.pinturaDescription || "Damos vida y realismo a tus figuras impresas. Nuestro equipo de artistas se especializa en la preparación de superficies, aplicación de imprimante, aerografía y pintura a pincel de nivel profesional para lograr acabados impecables.",
      features: [
        "Lijado, curado y eliminación de líneas de soporte",
        "Pintura con aerógrafo para degradados suaves",
        "Detallado manual con acrílicos de alta gama",
        "Capas protectoras transparentes (mate, satinado o brillante)"
      ],
      image: getValidImage(content?.sections?.pinturaImage, "https://lh3.googleusercontent.com/aida-public/AB6AXuA5kpLecDl-mNwoFkAyrq6nKvOykmdpsYwfaxVzorx_QfhF9btDBD4xHpcYp6Rgfx_sT3ZFFJHEaUtM84V9CIQOddHsyYzxpfZlfWXD8EIkjnwpwDbZfrfEv2okaCv75ph2oZfCUV08DFgDZGydfTV_xCGbl2hBz9NOLW0K57OrcskrNtjy3oP4RgOQnf9aQUg2IX1zNFFeroKZflLw4tg5eTvpSXsTYtq7SMzp2AHNEbdQbTEz9TGBiHvDl2wyyBIXerMsE5vl3dNl"),
      icon: "palette"
    },
    {
      id: "venta-archivos",
      title: content?.sections?.archivosTitle || "Venta y Licenciamiento de Archivos 3D (STL)",
      tag: "Colección Premium",
      description: content?.sections?.archivosDescription || "Accede a nuestra biblioteca exclusiva de modelos 3D listos para descargar e imprimir en tu propia impresora. Cada archivo cuenta con soportes pre-diseñados y optimizados para resina y filamento garantizando una impresión perfecta al primer intento.",
      features: [
        "Archivos STL premium y de alta definición",
        "Modelos pre-soportados probados físicamente",
        "Licencias de uso personal y opciones comerciales",
        "Actualizaciones constantes con nuevos lanzamientos"
      ],
      image: getValidImage(content?.sections?.archivosImage, "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2000"),
      icon: "folder_zip"
    }
  ];

  return (
    <>
      <TopNavBar />
      <main className="pt-24 bg-surface text-on-surface">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center px-8 lg:px-24 py-20 overflow-hidden bg-[#0e0e0e]">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964"
              alt="Estructuras y modelado 3D abstracto"
              fill
              className="object-cover grayscale brightness-50 opacity-15"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-4xl">
            <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold tracking-[0.2em] uppercase mb-6 rounded-sm">
              {content?.subtitle || "Servicios Especializados"}
            </span>
            <h1 
              className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-8 font-headline uppercase"
              style={{ wordBreak: "break-word" }}
            >
              {content?.title || "MÁS ALLÁ DE LA IMPRESIÓN."}
            </h1>
            <p className="text-xl text-on-surface/70 leading-relaxed max-w-2xl font-light font-body">
              {content?.description || "Ofrecemos una gama completa de soluciones digitales y analógicas para dar vida a tus proyectos de colección, ingeniería, arquitectura y arte."}
            </p>
          </div>
        </section>

        {/* Services List Section */}
        <section className="px-8 lg:px-24 py-32 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto space-y-32">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center`}
                >
                  {/* Image Block */}
                  <div
                    className={`lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group border border-[#af8782]/10 ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-all duration-700 scale-105 group-hover:scale-100 filter brightness-90 hover:brightness-100"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-md border border-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ffb4ab] text-sm">
                        {service.icon}
                      </span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest font-label">
                        {service.tag}
                      </span>
                    </div>
                  </div>

                  {/* Content Block */}
                  <div
                    className={`lg:col-span-6 space-y-6 ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <span className="text-[#ffb4ab] text-xs font-bold tracking-widest uppercase font-label">
                      Servicio {index + 1}
                    </span>
                    <h2
                      className="text-4xl md:text-5xl font-bold tracking-tight font-headline"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {service.title}
                    </h2>
                    <p className="text-on-surface/60 leading-relaxed text-lg font-body">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-3 pt-4">
                      {service.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-sm text-on-surface/80">
                          <span className="material-symbols-outlined text-primary-container text-lg">
                            check_circle
                          </span>
                          <span className="font-body">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <div className="pt-6">
                      <a
                        href="https://wa.me/51925219464"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-primary-container text-white px-8 py-4 font-bold tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-[0.98] font-label shadow-lg shadow-primary-container/20 transition-all text-sm"
                      >
                        <span className="material-symbols-outlined text-base">chat</span>
                        Consultar Servicio
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA section */}
        <section className="py-24 md:py-32 bg-[#0e0e0e] text-center px-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#ffb4ab]/3 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />
          <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
            <h2
              className="text-4xl md:text-6xl font-bold font-headline uppercase leading-none"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              ¿Tienes un proyecto <br />
              <span className="text-primary-container">en mente?</span>
            </h2>
            <p className="text-on-surface/60 max-w-xl mx-auto text-lg font-body">
              Contáctanos hoy mismo para obtener una cotización a medida y asesoramiento técnico profesional sin costo.
            </p>
            <div>
              <a
                href="https://wa.me/51925219464"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-primary-container text-white px-10 py-5 font-bold tracking-widest uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all text-base shadow-lg shadow-primary-container/20"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Iniciar Comisión
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
