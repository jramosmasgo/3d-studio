import TopNavBar from "../components/TopNavBar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function NosotrosPage() {
  return (
    <>
      <TopNavBar />
      <main className="pt-24 bg-surface text-on-surface">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center px-8 lg:px-24 py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070"
              alt="Laboratorio de impresión 3D"
              fill
              className="object-cover grayscale brightness-50 opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-4xl">
            <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold tracking-[0.2em] uppercase mb-6 rounded-sm">
              Artesanía Aditiva Industrial
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-8 font-headline uppercase">
              Impresión 3D <br />
              <span className="text-primary-container">Diseño y</span> <br />
              Modelado.
            </h1>
            <p className="text-xl text-on-surface/70 leading-relaxed max-w-2xl font-light font-body">
              Studio 3D es una empresa especializada en impresión 3D, modelado digital y diseño personalizado. Desarrollamos maquetas, prototipos, personajes, figuras animadas, piezas mecánicas y proyectos técnicos para ingeniería, arquitectura, diseño y emprendimientos.
            </p>
          </div>
        </section>

        {/* Mission & Vision (Bento-style layout) */}
        <section className="px-8 lg:px-24 py-24 bg-surface-container-lowest">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto">
            <div className="md:col-span-8 bg-surface-container-low p-12 flex flex-col justify-between min-h-[400px] border border-outline-variant/5">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-6 font-headline">
                  NUESTRA MISIÓN
                </h2>
                <p className="text-lg text-on-surface/60 leading-relaxed font-body">
                  En Studio 3D transformamos ideas en proyectos reales mediante impresión 3D, modelado digital y diseño personalizado. Brindamos soluciones innovadoras en creación de personajes, figuras animadas, piezas técnicas mecánicas y asesoría especializada en software como Fusion 360, Blender y AutoCAD, ofreciendo calidad, creatividad y tecnología para estudiantes, empresas y profesionales.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="px-4 py-2 bg-surface-bright rounded-md border border-outline-variant/20">
                  <p className="text-[10px] font-bold text-primary-container tracking-widest uppercase">
                    Precisión
                  </p>
                  <p className="text-sm">Detalle de Capa 0.05mm</p>
                </div>
                <div className="px-4 py-2 bg-surface-bright rounded-md border border-outline-variant/20">
                  <p className="text-[10px] font-bold text-primary-container tracking-widest uppercase">
                    Materiales
                  </p>
                  <p className="text-sm">Resinas de Grado Ingeniería</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-primary-container p-12 flex flex-col justify-center relative overflow-hidden group">
              <h2 className="text-4xl font-bold tracking-tight text-white mb-6 font-headline relative z-10">
                VISIÓN
              </h2>
              <p className="text-lg text-white/80 leading-relaxed font-body relative z-10">
                Ser una empresa líder en fabricación digital y diseño 3D en Perú, reconocida por la innovación, creatividad y excelencia en impresión 3D, desarrollo de personajes, proyectos técnicos y asesoramiento profesional para distintas industrias y áreas académicas.
              </p>
              <span className="material-symbols-outlined text-9xl text-white/10 absolute -bottom-4 -right-4 transition-transform group-hover:scale-110 duration-700">
                rocket_launch
              </span>
            </div>
          </div>
        </section>

        {/* What We Do (Asymmetric Section) */}
        <section className="px-8 lg:px-24 py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-container/20 blur-3xl rounded-full"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden group">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5kpLecDl-mNwoFkAyrq6nKvOykmdpsYwfaxVzorx_QfhF9btDBD4xHpcYp6Rgfx_sT3ZFFJHEaUtM84V9CIQOddHsyYzxpfZlfWXD8EIkjnwpwDbZfrfEv2okaCv75ph2oZfCUV08DFgDZGydfTV_xCGbl2hBz9NOLW0K57OrcskrNtjy3oP4RgOQnf9aQUg2IX1zNFFeroKZflLw4tg5eTvpSXsTYtq7SMzp2AHNEbdQbTEz9TGBiHvDl2wyyBIXerMsE5vl3dNl"
                      alt="Proceso de acabado artesanal"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  </div>
                  <div className="relative h-80 w-full rounded-lg overflow-hidden group">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqBuEyIxkt9XqmgXy_OYjvT5G8LzEEsMbp5x8WSH0v0Yyk7MVUZgt8bc3pDpslvZ3q_W5TDu6h9e8G7BwnxVw28RrqMrlNm33rObH1BXZDdV-fRfq0H6FWqIa-8144f2TCRrGsIuE0lxmf5UQnXyF0RsTON_ZcItLPWqzh8zTvoMizPG7gnXRkh5qNHEZ5ljogcWXeNP-8QAEDe8M0HcccPc6vYs5Qa1BDy-5_DeCiXGSsa5ELf_kdmMbZUcI737cs2IBh6POuI_B2"
                      alt="Impresoras industriales"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative h-80 w-full rounded-lg overflow-hidden group">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFlfiUM9E09r2j2gK6ti308bGSFoyN7Nh-oy6eN5TQBm4n9bt1XhRo12zSIGIqJcgypMnnofEwnBxo9QrUYqGvHwlu66msDFWRvu6UwQFdJwxmHWcpotQuSq40EhD6-rhFTRBTXFjtoCi2Nsr-ABm_UNin-viJBm5H6YszR8I6dHCyIpFX8bQCAOWh6fsPEXq14agiHTGSmVVrgkPGCCZ89vVCTGGAz1Orbb7yP7jEmBGPKVJMq9oA8wZwTfCUtx1GATpOguBysPh4"
                      alt="Diseño digital a físico"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  </div>
                  <div className="relative h-64 w-full rounded-lg overflow-hidden group">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPi2WGnDf-EVCczXhwVhHaESNL9gFAPLd00z-7enFJztEIlolHho2UALCqcjcw-XHv2U8z8G7683gEcLd4UITG66Twq4zJISRnYHbeRdZ4-KAHQgcGhfLba4jg-cULx50i-Yi9hyut05-ieaQpW_Th1KG6KRJpNqq1xIWa1A3Ma6lI1pF-BovbzsiJE6KL_zkG9TZfyeKLKOa6qUMOi7dDkRwRiIaOC2G5DT94b2LM_kqyCQ5cbMLkW4TVdB9_D2hSg5cvCbzOs8"
                      alt="Detalle microscópico de impresión"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl font-bold tracking-tighter mb-12 leading-tight font-headline">
                INGENIERÍA <br /> ADITIVA DE <br />{" "}
                <span className="text-primary-container">PRECISIÓN.</span>
              </h2>
              <div className="space-y-10">
                <div className="group">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-3 font-headline transition-colors group-hover:text-primary">
                    <span className="material-symbols-outlined text-primary-container">
                      architecture
                    </span>
                    DISEÑO PERSONALIZADO
                  </h3>
                  <p className="text-on-surface/50 leading-relaxed font-body">
                    Brindamos asesoría y desarrollo de proyectos en Fusion 360, Blender y AutoCAD, ayudando a estudiantes y profesionales a convertir sus ideas en soluciones funcionales y visualmente impactantes.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-3 font-headline transition-colors group-hover:text-primary">
                    <span className="material-symbols-outlined text-primary-container">
                      precision_manufacturing
                    </span>
                    RESINA Y FILAMENTO
                  </h3>
                  <p className="text-on-surface/50 leading-relaxed font-body">
                    Trabajamos con impresión 3D en resina y filamento, ofreciendo acabados de alta calidad y precisión técnica para maquetas, prototipos y piezas mecánicas.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-3 font-headline transition-colors group-hover:text-primary">
                    <span className="material-symbols-outlined text-primary-container">
                      local_shipping
                    </span>
                    ENVÍOS NACIONALES
                  </h3>
                  <p className="text-on-surface/50 leading-relaxed font-body">
                    Ofrecemos envíos a nivel nacional en todo el Perú, asegurando que tus proyectos lleguen de manera segura y puntual a cualquier destino.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Contact Section */}
        <section className="px-8 lg:px-24 py-32 bg-surface">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-5xl font-bold tracking-tighter mb-8 font-headline">
                PONTE EN <span className="text-primary-container">CONTACTO.</span>
              </h2>
              <p className="text-on-surface/60 mb-12 max-w-md font-body">
                ¿Listo para comenzar una comisión personalizada o tienes una
                consulta técnica? Nuestro equipo está disponible para
                consultas técnicas detalladas.
              </p>
              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center rounded-sm transition-colors group-hover:bg-primary-container/20">
                    <span className="material-symbols-outlined text-primary-container">
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface/40 mb-1 font-label">
                      Sede Central
                    </p>
                    <p className="text-lg font-body">
                      Alejandro O. Destua #689, Huancayo, Peru
                    </p>
                    <p className="text-lg text-on-surface/60 font-body">
                      Alejandro O. Destus y Moquegua # 496
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center rounded-sm transition-colors group-hover:bg-primary-container/20">
                    <span className="material-symbols-outlined text-primary-container">
                      alternate_email
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface/40 mb-1 font-label">
                      Línea Directa
                    </p>
                    <p className="text-lg font-body">aristudio3d@gmail.com</p>
                    <p className="text-lg text-on-surface/60 font-body">
                      +51 925 219 464 / 927 081 383
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center rounded-sm transition-colors group-hover:bg-primary-container/20">
                    <span className="material-symbols-outlined text-primary-container">
                      share
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-on-surface/40 mb-1 font-label">
                      Redes Sociales
                    </p>
                    <div className="flex gap-4 mt-2">
                      <a href="https://www.facebook.com/profile.php?id=61566271775580" target="_blank" rel="noopener noreferrer" className="text-on-surface/60 hover:text-primary-container transition-colors">Facebook</a>
                      <span className="text-on-surface/20">/</span>
                      <a href="https://www.instagram.com/studio3d.hyo" target="_blank" rel="noopener noreferrer" className="text-on-surface/60 hover:text-primary-container transition-colors">Instagram</a>
                      <span className="text-on-surface/20">/</span>
                      <a href="https://www.tiktok.com/@studio3d.hyo" target="_blank" rel="noopener noreferrer" className="text-on-surface/60 hover:text-primary-container transition-colors">TikTok</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 w-full h-64 bg-surface-container-highest rounded-lg overflow-hidden relative border border-outline-variant/10">
                <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvJgLBojQpnS4vPqAD6qAJf4B69B1q-ETovMU1eRxgYIzdG2PTDwz6DCi2hMWt6Cus8YnpGk-5g_ANGzZl1jtx4qG1LDyRdMbL8LIjsq3lvG5dvPLH_x4wm4dDuXRXBVwzn23MTxM32kQK7UtCtqDMJ9YjnuIcA6nZNlsv9jgD-1cDljVLk3QoXVtoywCcxNSxFK9zqUO6UcOC-ZjPWgUSXoNrReDQeDkhSveSe6_TTHdvArWeMyQf4Xhpqx0mAdzbilK3ZmfDPBOz"
                    alt="Mapa de ubicación"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 bg-primary-container rounded-full animate-pulse border-4 border-white/20"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <form className="bg-surface-container-low p-10 lg:p-16 rounded-sm space-y-8 border border-outline-variant/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                      Nombre Completo
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border-none p-4 rounded-sm focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all font-body"
                      placeholder="John Wick"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                      Correo Electrónico
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border-none p-4 rounded-sm focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all font-body"
                      placeholder="john@continental.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Asunto
                  </label>
                  <input
                    className="w-full bg-surface-container-highest border-none p-4 rounded-sm focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all font-body"
                    placeholder="Consulta de Comisión Personalizada"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Mensaje
                  </label>
                  <textarea
                    className="w-full bg-surface-container-highest border-none p-4 rounded-sm focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/20 resize-none outline-none transition-all font-body"
                    placeholder="Describe los requisitos de tu proyecto, preferencias de material y escala..."
                    rows={6}
                  ></textarea>
                </div>
                <button
                  className="w-full py-4 bg-primary-container text-white font-bold tracking-widest uppercase rounded-sm hover:brightness-110 transition-all active:scale-[0.98] font-label shadow-lg shadow-primary-container/20"
                  type="submit"
                >
                  INICIALIZAR TRANSMISIÓN
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
