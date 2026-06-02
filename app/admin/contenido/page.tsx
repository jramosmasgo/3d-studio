"use client";

import { useEffect, useRef, useState } from "react";
import { getPageContent, savePageContent, seedAllContent, type PageContent } from "@/lib/firebase/contenido-service";
import ImageUploader from "@/app/components/ui/ImageUploader";

type ActiveTab = "inicio" | "servicios" | "nosotros";

interface SectionConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: {
    key: string;
    label: string;
    type: "text" | "textarea" | "image";
    isSectionField: boolean;
  }[];
}

export default function AdminContenidoPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inicio");
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [selectedSection, setSelectedSection] = useState<SectionConfig | null>(null);
  const [modalData, setModalData] = useState<Record<string, string>>({});
  // Ref always points to latest modalData for use inside callbacks without stale closure
  const modalDataRef = useRef<Record<string, string>>({});
  modalDataRef.current = modalData;

  // Load content
  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      setMessage(null);
      try {
        const data = await getPageContent(activeTab);
        setContent(data);
      } catch (error) {
        console.error("Error loading content:", error);
        setMessage({ type: "error", text: "Error al cargar el contenido de la página." });
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [activeTab]);

  // Seed all content to Firebase
  const handleSeedAll = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const { seeded } = await seedAllContent();
      // Reload current tab content from Firebase
      const data = await getPageContent(activeTab);
      setContent(data);
      setMessage({
        type: "success",
        text: `✅ Contenido inicializado en Firebase: ${seeded.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}.`,
      });
    } catch (error) {
      console.error("Error seeding content:", error);
      setMessage({ type: "error", text: "Error al inicializar el contenido en Firebase." });
    } finally {
      setSeeding(false);
    }
  };

  // Section configurations for each tab
  const sectionsMap: Record<ActiveTab, SectionConfig[]> = {
    inicio: [
      {
        id: "inicio-hero-main",
        title: "Hero Principal (Banner de Entrada)",
        description: "Administra los textos del banner principal (Hero), las métricas destacadas y la tarjeta de producto destacado con su link correspondiente.",
        icon: "home_app_logo",
        fields: [
          { key: "heroBadge", label: "Etiqueta / Badge Superior", type: "text", isSectionField: true },
          { key: "heroTitle1", label: "Título Línea 1 (Blanco)", type: "text", isSectionField: true },
          { key: "heroTitle2", label: "Título Línea 2 (Rojo)", type: "text", isSectionField: true },
          { key: "heroDescription", label: "Texto Descriptivo Principal", type: "textarea", isSectionField: true },
          { key: "heroStat1Value", label: "Métrica 1: Valor (ej: 0.02mm)", type: "text", isSectionField: true },
          { key: "heroStat1Label", label: "Métrica 1: Etiqueta (ej: Detalle)", type: "text", isSectionField: true },
          { key: "heroStat2Value", label: "Métrica 2: Valor (ej: 8K)", type: "text", isSectionField: true },
          { key: "heroStat2Label", label: "Métrica 2: Etiqueta (ej: Resin Core)", type: "text", isSectionField: true },
          { key: "heroStat3Value", label: "Métrica 3: Valor (ej: MUSEO)", type: "text", isSectionField: true },
          { key: "heroStat3Label", label: "Métrica 3: Etiqueta (ej: Acabado)", type: "text", isSectionField: true },
          { key: "heroCardTitle", label: "Tarjeta Derecha: Título", type: "text", isSectionField: true },
          { key: "heroCardDesc", label: "Tarjeta Derecha: Detalles / Especificación", type: "text", isSectionField: true },
          { key: "heroCardImage", label: "Tarjeta Derecha: Imagen del Producto Destacado", type: "image", isSectionField: true },
          { key: "heroCardLink", label: "Tarjeta Derecha: Enlace (URL)", type: "text", isSectionField: true },
        ],
      },
      {
        id: "inicio-novedades",
        title: "Novedades y Ofertas",
        description: "Administra las dos tarjetas principales de novedades y ofertas: imágenes, textos descriptivos, etiquetas, precios y links de destino.",
        icon: "shopping_bag",
        fields: [
          // Card 1
          { key: "novCard1Badge", label: "Tarjeta 1 (Izquierda): Etiqueta superior (ej: Edición Limitada)", type: "text", isSectionField: true },
          { key: "novCard1Title", label: "Tarjeta 1 (Izquierda): Título Principal", type: "text", isSectionField: true },
          { key: "novCard1Desc", label: "Tarjeta 1 (Izquierda): Descripción o Subtítulo", type: "textarea", isSectionField: true },
          { key: "novCard1BtnText", label: "Tarjeta 1 (Izquierda): Texto del Botón", type: "text", isSectionField: true },
          { key: "novCard1BtnLink", label: "Tarjeta 1 (Izquierda): Enlace del Botón", type: "text", isSectionField: true },
          { key: "novCard1Image", label: "Tarjeta 1 (Izquierda): Imagen de Fondo", type: "image", isSectionField: true },
          // Card 2
          { key: "novCard2Badge", label: "Tarjeta 2 (Derecha): Etiqueta superior (ej: RESTOCK)", type: "text", isSectionField: true },
          { key: "novCard2Title", label: "Tarjeta 2 (Derecha): Título Principal", type: "text", isSectionField: true },
          { key: "novCard2Desc", label: "Tarjeta 2 (Derecha): Descripción o Subtítulo", type: "textarea", isSectionField: true },
          { key: "novCard2Price", label: "Tarjeta 2 (Derecha): Precio Actual (ej: S/. 35.00)", type: "text", isSectionField: true },
          { key: "novCard2OldPrice", label: "Tarjeta 2 (Derecha): Precio Anterior tachado (ej: S/. 45.00)", type: "text", isSectionField: true },
          { key: "novCard2Link", label: "Tarjeta 2 (Derecha): Enlace de Redirección", type: "text", isSectionField: true },
          { key: "novCard2Image", label: "Tarjeta 2 (Derecha): Imagen Lateral", type: "image", isSectionField: true },
        ],
      },
      {
        id: "inicio-capacidades",
        title: "Nuestras Capacidades",
        description: "Controla los textos del panel de capacidades de la empresa, los tres pilares de servicio, la tarjeta flotante de calidad y la imagen del modelo 3D.",
        icon: "construction",
        fields: [
          { key: "capBadge", label: "Etiqueta superior (ej: Nuestras Capacidades)", type: "text", isSectionField: true },
          { key: "capTitle", label: "Título Principal de la Sección", type: "text", isSectionField: true },
          { key: "cap1Title", label: "Capacidad 1: Título", type: "text", isSectionField: true },
          { key: "cap1Desc", label: "Capacidad 1: Descripción", type: "textarea", isSectionField: true },
          { key: "cap2Title", label: "Capacidad 2: Título", type: "text", isSectionField: true },
          { key: "cap2Desc", label: "Capacidad 2: Descripción", type: "textarea", isSectionField: true },
          { key: "cap3Title", label: "Capacidad 3: Título", type: "text", isSectionField: true },
          { key: "cap3Desc", label: "Capacidad 3: Descripción", type: "textarea", isSectionField: true },
          { key: "capBadgeTitle", label: "Tarjeta de Calidad: Título", type: "text", isSectionField: true },
          { key: "capBadgeDesc", label: "Tarjeta de Calidad: Descripción", type: "textarea", isSectionField: true },
          { key: "capImage", label: "Imagen del Proceso de Impresión 3D", type: "image", isSectionField: true },
        ],
      },
      {
        id: "inicio-testimonios",
        title: "Testimonios (Opiniones)",
        description: "Administra el encabezado general y los testimonios/opiniones de los clientes que se muestran en la sección correspondiente del Home.",
        icon: "rate_review",
        fields: [
          { key: "testSubtitle", label: "Etiqueta superior (ej: Testimonios)", type: "text", isSectionField: true },
          { key: "testTitle", label: "Título de la Sección", type: "text", isSectionField: true },
          { key: "testDesc", label: "Descripción de la Sección", type: "textarea", isSectionField: true },
          { key: "test1Name", label: "Testimonio 1: Nombre de Cliente", type: "text", isSectionField: true },
          { key: "test1Role", label: "Testimonio 1: Rol / Cargo", type: "text", isSectionField: true },
          { key: "test1Quote", label: "Testimonio 1: Contenido", type: "textarea", isSectionField: true },
          { key: "test2Name", label: "Testimonio 2: Nombre de Cliente", type: "text", isSectionField: true },
          { key: "test2Role", label: "Testimonio 2: Rol / Cargo", type: "text", isSectionField: true },
          { key: "test2Quote", label: "Testimonio 2: Contenido", type: "textarea", isSectionField: true },
          { key: "test3Name", label: "Testimonio 3: Nombre de Cliente", type: "text", isSectionField: true },
          { key: "test3Role", label: "Testimonio 3: Rol / Cargo", type: "text", isSectionField: true },
          { key: "test3Quote", label: "Testimonio 3: Contenido", type: "textarea", isSectionField: true },
        ],
      },
    ],
    servicios: [
      {
        id: "servicios-header",
        title: "Cabecera de Servicios",
        description: "Edita el título grande y la descripción general que abre la página de servicios especiales.",
        icon: "layers",
        fields: [
          { key: "subtitle", label: "Etiqueta superior (Subtítulo)", type: "text", isSectionField: false },
          { key: "title", label: "Título Principal", type: "text", isSectionField: false },
          { key: "description", label: "Descripción de cabecera", type: "textarea", isSectionField: false },
        ],
      },
      {
        id: "servicios-diseno",
        title: "1. Diseño & Escultura 3D",
        description: "Actualiza el título, la descripción y la imagen de cabecera del servicio de modelado digital.",
        icon: "architecture",
        fields: [
          { key: "disenoTitle", label: "Nombre de Servicio", type: "text", isSectionField: true },
          { key: "disenoDescription", label: "Descripción Detallada", type: "textarea", isSectionField: true },
          { key: "disenoImage", label: "Imagen del Servicio", type: "image", isSectionField: true },
        ],
      },
      {
        id: "servicios-pintura",
        title: "2. Pintura & Acabado Artístico",
        description: "Edita el texto y la imagen de presentación del servicio de pintura artesanal.",
        icon: "palette",
        fields: [
          { key: "pinturaTitle", label: "Nombre de Servicio", type: "text", isSectionField: true },
          { key: "pinturaDescription", label: "Descripción Detallada", type: "textarea", isSectionField: true },
          { key: "pinturaImage", label: "Imagen del Servicio", type: "image", isSectionField: true },
        ],
      },
      {
        id: "servicios-archivos",
        title: "3. Venta de Archivos 3D",
        description: "Personaliza los textos y la imagen referidos al catálogo digital de archivos STL.",
        icon: "folder_zip",
        fields: [
          { key: "archivosTitle", label: "Nombre de Servicio", type: "text", isSectionField: true },
          { key: "archivosDescription", label: "Descripción Detallada", type: "textarea", isSectionField: true },
          { key: "archivosImage", label: "Imagen del Servicio", type: "image", isSectionField: true },
        ],
      },
    ],
    nosotros: [
      {
        id: "nosotros-header",
        title: "Cabecera de Nosotros",
        description: "Ajusta la presentación inicial de la historia, identidad y el banner de fondo de Nosotros.",
        icon: "info",
        fields: [
          { key: "subtitle", label: "Etiqueta superior (Subtítulo)", type: "text", isSectionField: false },
          { key: "title", label: "Título Principal", type: "text", isSectionField: false },
          { key: "description", label: "Descripción general de la marca", type: "textarea", isSectionField: false },
          { key: "heroImage", label: "Imagen de Fondo del Banner", type: "image", isSectionField: true },
        ],
      },
      {
        id: "nosotros-mision-vision",
        title: "Misión & Visión Organizacional",
        description: "Edita la declaración formal de Misión, Visión y metas clave de la empresa en Perú.",
        icon: "rocket_launch",
        fields: [
          { key: "misionTitle", label: "Misión: Título", type: "text", isSectionField: true },
          { key: "misionContent", label: "Misión: Declaración principal", type: "textarea", isSectionField: true },
          { key: "visionTitle", label: "Visión: Título", type: "text", isSectionField: true },
          { key: "visionContent", label: "Visión: Declaración principal", type: "textarea", isSectionField: true },
        ],
      },
      {
        id: "nosotros-ingenieria",
        title: "Sección de Ingeniería y Galería",
        description: "Edita la galería de 4 fotos y los textos explicativos del panel de ingeniería de precisión.",
        icon: "construction",
        fields: [
          { key: "ingenieriaTitle", label: "Título General de la Sección", type: "text", isSectionField: true },
          { key: "item1Title", label: "Columna 1: Título", type: "text", isSectionField: true },
          { key: "item1Desc", label: "Columna 1: Descripción", type: "textarea", isSectionField: true },
          { key: "item2Title", label: "Columna 2: Título", type: "text", isSectionField: true },
          { key: "item2Desc", label: "Columna 2: Descripción", type: "textarea", isSectionField: true },
          { key: "item3Title", label: "Columna 3: Título", type: "text", isSectionField: true },
          { key: "item3Desc", label: "Columna 3: Descripción", type: "textarea", isSectionField: true },
          { key: "galeriaImg1", label: "Imagen de Galería 1 (Acabado)", type: "image", isSectionField: true },
          { key: "galeriaImg2", label: "Imagen de Galería 2 (Impresoras)", type: "image", isSectionField: true },
          { key: "galeriaImg3", label: "Imagen de Galería 3 (Diseño digital)", type: "image", isSectionField: true },
          { key: "galeriaImg4", label: "Imagen de Galería 4 (Detalle macro)", type: "image", isSectionField: true },
        ],
      },
    ],
  };

  const handleOpenModal = (section: SectionConfig) => {
    if (!content) return;
    const initialData: Record<string, string> = {};
    section.fields.forEach((f) => {
      if (f.isSectionField) {
        // Use saved value, or fall back to section key from content.sections (which already merges fallbacks)
        initialData[f.key] = content.sections?.[f.key] ?? "";
      } else {
        initialData[f.key] = (content as any)[f.key] ?? "";
      }
    });
    setModalData(initialData);
    setSelectedSection(section);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !selectedSection) return;
    setSaving(true);
    setMessage(null);

    try {
      const updatedContent = { ...content };
      selectedSection.fields.forEach((f) => {
        if (f.isSectionField) {
          // Never overwrite image fields with an empty string — keep the previous value
          if (f.type === "image" && !modalData[f.key]) return;
          updatedContent.sections = {
            ...updatedContent.sections,
            [f.key]: modalData[f.key],
          };
        } else {
          if (f.type === "image" && !modalData[f.key]) return;
          (updatedContent as any)[f.key] = modalData[f.key];
        }
      });

      const { id, ...data } = updatedContent;
      await savePageContent(activeTab, data);
      setContent(updatedContent);
      setSelectedSection(null);
      setMessage({ type: "success", text: "¡Sección guardada y actualizada con éxito!" });
    } catch (error) {
      console.error("Error saving content section:", error);
      setMessage({ type: "error", text: "Error al guardar los cambios de la sección." });
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "inicio", label: "Inicio", icon: "home" },
    { id: "servicios", label: "Servicios", icon: "construction" },
    { id: "nosotros", label: "Nosotros", icon: "group" },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline uppercase tracking-tight">
            Gestor de Contenido
          </h1>
          <p className="text-on-surface/40 text-sm font-body mt-2">
            Selecciona una sección a continuación para abrir el editor modular y modificar el contenido del sitio web del cliente.
          </p>
        </div>

        {/* Seed button */}
        <button
          onClick={handleSeedAll}
          disabled={seeding}
          title="Guarda todos los textos e imágenes por defecto en Firebase. Úsalo la primera vez o para restaurar valores iniciales."
          className="flex-shrink-0 flex items-center gap-2 bg-surface-container-highest border border-outline-variant/20 hover:border-primary-container/50 text-on-surface/70 hover:text-primary-container px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest font-label transition-all disabled:opacity-50 group"
        >
          {seeding ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">cloud_upload</span>
              <span>Inicializar en Firebase</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "border-primary-container text-primary-container bg-surface-container-low/20"
                : "border-transparent text-on-surface/40 hover:text-on-surface hover:border-on-surface/20"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Status Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-[#ffb4ab]/5 border-[#ffb4ab]/20 text-[#ffb4ab]"
              : "bg-red-950/20 border-red-900/30 text-red-400"
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <p className="text-sm font-medium font-body">{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
            progress_activity
          </span>
          <p className="text-on-surface/40 text-sm font-label tracking-widest uppercase">
            Cargando secciones...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {sectionsMap[activeTab].map((section) => (
            <div
              key={section.id}
              onClick={() => handleOpenModal(section)}
              className="bg-surface-container-low border border-outline-variant/5 hover:border-primary-container/40 p-8 rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-black/25 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest/60 border border-outline-variant/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">{section.icon}</span>
                </div>
                <h3 className="text-xl font-bold font-headline uppercase group-hover:text-primary-container transition-colors">
                  {section.title}
                </h3>
                <p className="text-on-surface/50 text-sm leading-relaxed font-body">
                  {section.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant/5 flex items-center justify-between text-xs text-primary-container font-label uppercase tracking-widest font-bold">
                <span>Editar Sección</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1 duration-300">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {selectedSection && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-outline-variant/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-2xl">
                  {selectedSection.icon}
                </span>
                <h3 className="text-xl font-bold font-headline uppercase tracking-tight">
                  Editar {selectedSection.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 text-on-surface/50 hover:text-on-surface hover:bg-surface-container-highest/80 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleSaveModal} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
              {selectedSection.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  {field.type === "image" ? (
                    <ImageUploader
                      label={field.label}
                      currentImageUrl={modalData[field.key] || ""}
                      onUpload={(result) =>
                        // Use functional updater to always have latest state (avoids stale closure bug)
                        setModalData((prev) => ({ ...prev, [field.key]: result.url }))
                      }
                      folder="contenido-home"
                    />
                  ) : (
                    <>
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={modalData[field.key] || ""}
                          onChange={(e) =>
                            setModalData((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          rows={5}
                          className="w-full bg-[#1b1b1b] border-none p-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none resize-none transition-all font-body text-sm leading-relaxed"
                        />
                      ) : (
                        <input
                          type="text"
                          value={modalData[field.key] || ""}
                          onChange={(e) =>
                            setModalData((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full bg-[#1b1b1b] border-none p-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none transition-all font-body text-sm"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Modal Footer / Actions */}
              <div className="pt-6 border-t border-outline-variant/10 flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setSelectedSection(null)}
                  className="px-6 py-3 border border-outline-variant/20 text-on-surface/60 hover:text-on-surface hover:bg-surface-container-highest rounded-xl text-xs font-bold uppercase tracking-widest font-label transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-container text-white px-8 py-3 font-bold tracking-widest uppercase rounded-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary-container/20 text-xs font-label"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
