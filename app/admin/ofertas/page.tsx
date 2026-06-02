"use client";

import { useState, useEffect } from "react";
import {
  getCategorias,
  getTags,
  type Categoria,
  type Tag,
} from "@/lib/firebase/config-service";
import {
  getOfertas,
  createOferta,
  updateOferta,
  deleteOferta,
  type Oferta,
  type DiscountType,
  type TargetType,
} from "@/lib/firebase/ofertas-service";

// ── Componente Principal ─────────────────────────────────────────────────────

export default function OfertasPage() {
  // Datos de Firestore
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tagsDisponibles, setTagsDisponibles] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null);

  // Estado del formulario (mapeado exactamente al JSON)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Error de formulario
  const [formError, setFormError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal de conflicto de activación
  const [conflictModal, setConflictModal] = useState<{
    ofertaToActivate: Oferta;
    activeOferta: Oferta;
  } | null>(null);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Cargar datos de Firestore ──────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const [ofrs, cats, tgs] = await Promise.all([
          getOfertas(),
          getCategorias(),
          getTags(),
        ]);
        setOfertas(ofrs);
        setCategorias(cats.filter((c) => c.active !== false));
        setTagsDisponibles(tgs.filter((t) => t.active !== false));
      } catch (err) {
        console.error("Error al cargar datos:", err);
        showToast("Error al cargar datos de Firestore.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Helpers del formulario ─────────────────────────────────────────────────

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setTargetType("all");
    setSelectedTags([]);
    setSelectedCategory("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setFormError(null);
  };

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  // ── Abrir Modal Crear ──────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingOferta(null);
    resetForm();
    if (categorias.length > 0) setSelectedCategory(categorias[0].nombre);
    setIsModalOpen(true);
  };

  // ── Abrir Modal Editar ─────────────────────────────────────────────────────

  const handleOpenEdit = (oferta: Oferta) => {
    setEditingOferta(oferta);
    setFormError(null);
    setTitle(oferta.title);
    setDescription(oferta.description);
    setDiscountType(oferta.discountType);
    setDiscountValue(String(oferta.discountValue));
    setTargetType(oferta.targetType);
    setSelectedTags(oferta.tags || []);
    setSelectedCategory(oferta.category || (categorias[0]?.nombre ?? ""));
    setStartDate(oferta.startDate);
    setEndDate(oferta.endDate);
    setIsModalOpen(true);
  };

  // ── Guardar Oferta (Firestore) ─────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones
    if (!title.trim()) return setFormError("El título es obligatorio.");
    if (!description.trim()) return setFormError("La descripción es obligatoria.");
    if (!discountValue.trim()) return setFormError("El valor de descuento es obligatorio.");
    const parsedValue = parseFloat(discountValue);
    if (isNaN(parsedValue) || parsedValue <= 0) return setFormError("El valor de descuento debe ser un número mayor a 0.");
    if (!startDate) return setFormError("La fecha de inicio es obligatoria.");
    if (endDate && endDate < startDate)
      return setFormError("La fecha de vencimiento no puede ser anterior a la de inicio.");
    if (targetType === "tags" && selectedTags.length === 0)
      return setFormError("Selecciona al menos un tag.");
    if (targetType === "category" && !selectedCategory.trim())
      return setFormError("Selecciona una categoría.");

    // Construir payload sin campos undefined (Firestore los rechaza)
    const payload: Omit<Oferta, "id"> = {
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: parsedValue,
      targetType,
      tags: targetType === "tags" ? selectedTags : [],
      startDate,
      endDate: endDate || "",
      isActive: false, // siempre se crea/actualiza con false al guardar
      ...(targetType === "category" ? { category: selectedCategory } : {}),
    };

    setIsSaving(true);
    try {
      if (editingOferta?.id) {
        await updateOferta(editingOferta.id, payload);
        setOfertas((prev) =>
          prev.map((o) => (o.id === editingOferta.id ? { ...o, ...payload } : o))
        );
        showToast("Oferta actualizada correctamente.", "success");
      } else {
        const created = await createOferta(payload);
        setOfertas((prev) => [created, ...prev]);
        showToast("Oferta creada correctamente (inactiva por defecto).", "success");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido al guardar.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("¿Estás seguro de eliminar esta oferta? Esta acción no se puede deshacer.")) return;
    try {
      await deleteOferta(id);
      setOfertas((prev) => prev.filter((o) => o.id !== id));
      showToast("Oferta eliminada correctamente.", "success");
    } catch {
      showToast("Error al eliminar la oferta.", "error");
    }
  };

  // ── Activar/Desactivar ─────────────────────────────────────────────────────

  const handleToggleActive = async (oferta: Oferta) => {
    if (!oferta.id) return;

    // Si se intenta DESACTIVAR → sin conflicto, proceder directo
    if (oferta.isActive) {
      try {
        setOfertas((prev) => prev.map((o) => (o.id === oferta.id ? { ...o, isActive: false } : o)));
        await updateOferta(oferta.id, { isActive: false });
        showToast("Oferta desactivada.", "success");
      } catch {
        setOfertas((prev) => prev.map((o) => (o.id === oferta.id ? { ...o, isActive: true } : o)));
        showToast("Error al desactivar la oferta.", "error");
      }
      return;
    }

    // Si se intenta ACTIVAR → verificar si ya hay otra activa
    const yaActiva = ofertas.find((o) => o.id !== oferta.id && o.isActive);
    if (yaActiva) {
      // Mostrar modal de confirmación de conflicto
      setConflictModal({ ofertaToActivate: oferta, activeOferta: yaActiva });
      return;
    }

    // Sin conflicto: activar directamente
    try {
      setOfertas((prev) => prev.map((o) => (o.id === oferta.id ? { ...o, isActive: true } : o)));
      await updateOferta(oferta.id, { isActive: true });
      showToast("Oferta activada correctamente.", "success");
    } catch {
      setOfertas((prev) => prev.map((o) => (o.id === oferta.id ? { ...o, isActive: false } : o)));
      showToast("Error al activar la oferta.", "error");
    }
  };

  // ── Resolver conflicto: desactivar la actual y activar la nueva ────────────

  const handleConfirmConflict = async () => {
    if (!conflictModal) return;
    const { ofertaToActivate, activeOferta } = conflictModal;
    setIsResolvingConflict(true);
    try {
      // Desactivar la que estaba activa
      await updateOferta(activeOferta.id!, { isActive: false });
      // Activar la nueva
      await updateOferta(ofertaToActivate.id!, { isActive: true });
      // Actualizar estado local
      setOfertas((prev) =>
        prev.map((o) => {
          if (o.id === activeOferta.id) return { ...o, isActive: false };
          if (o.id === ofertaToActivate.id) return { ...o, isActive: true };
          return o;
        })
      );
      showToast(`"${ofertaToActivate.title}" activada. "${activeOferta.title}" desactivada.`, "success");
    } catch {
      showToast("Error al resolver el conflicto de ofertas.", "error");
    } finally {
      setIsResolvingConflict(false);
      setConflictModal(null);
    }
  };

  // ── Filtros ────────────────────────────────────────────────────────────────

  const filteredOfertas = ofertas.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      o.title.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.tags.some((t) => t.toLowerCase().includes(q)) ||
      (o.category?.toLowerCase().includes(q) ?? false);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && o.isActive) ||
      (statusFilter === "INACTIVE" && !o.isActive);

    return matchesQuery && matchesStatus;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Modal de Conflicto de Activación */}
      {conflictModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-neutral-300">warning</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
                  Conflicto de Activación
                </h3>
                <p className="text-xs text-on-surface/50 font-body leading-relaxed">
                  Solo puede haber <span className="font-bold text-on-surface/80">una oferta activa</span> a la vez.
                  Actualmente está activa:
                </p>
              </div>
            </div>

            {/* Oferta activa actual */}
            <div className="mx-6 mb-4 p-3 bg-surface-container-highest rounded-xl border border-outline-variant/10">
              <p className="text-[10px] text-on-surface/40 font-label uppercase tracking-wider mb-1">Actualmente activa</p>
              <p className="text-sm font-bold font-headline text-on-surface">{conflictModal.activeOferta.title}</p>
              <p className="text-[11px] text-on-surface/50 font-body line-clamp-1 mt-0.5">{conflictModal.activeOferta.description}</p>
            </div>

            {/* Pregunta */}
            <div className="px-6 pb-2">
              <p className="text-xs text-on-surface/60 font-body">
                ¿Deseas desactivar <span className="font-bold text-on-surface/80">"{conflictModal.activeOferta.title}"</span> y activar <span className="font-bold text-on-surface/80">"{conflictModal.ofertaToActivate.title}"</span>?
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 px-6 py-4 border-t border-outline-variant/10 mt-2">
              <button
                onClick={() => setConflictModal(null)}
                disabled={isResolvingConflict}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/10 text-on-surface/60 hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConflict}
                disabled={isResolvingConflict}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 hover:bg-neutral-700 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResolvingConflict && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {isResolvingConflict ? "Cambiando..." : "Sí, cambiar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all duration-300
            ${
              toast.type === "success"
                ? "bg-neutral-800/90 text-neutral-100 border-neutral-700 backdrop-blur-md"
                : "bg-red-950/90 text-red-300 border-red-800/50 backdrop-blur-md"
            }`}
          role="alert"
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold font-headline tracking-tighter uppercase">
            Ofertas y Descuentos
          </h1>
          <p className="text-on-surface/40 text-xs sm:text-sm font-body">
            Gestiona las campañas promocionales. Las nuevas ofertas se crean inactivas por defecto.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-container-highest hover:bg-neutral-700 text-on-surface font-bold uppercase tracking-wider text-xs px-6 py-4 rounded-xl shadow-lg border border-outline-variant/10 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-lg">local_offer</span>
          Nueva Oferta
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-outline-variant/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, descripción, tags o categoría..."
              className="w-full bg-surface-container-highest border-none pl-11 pr-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface placeholder:text-on-surface/30 outline-none transition-all text-xs sm:text-sm font-body"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg">
              toggle_on
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-surface-container-highest border-none pl-11 pr-10 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface outline-none transition-all text-xs sm:text-sm font-body cursor-pointer appearance-none"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activas</option>
              <option value="INACTIVE">Inactivas</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Ofertas */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-body border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-highest/50 text-on-surface/60 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">Oferta / Campaña</th>
                <th className="px-6 py-4">Descuento</th>
                <th className="px-6 py-4">Aplica A</th>
                <th className="px-6 py-4">Vigencia</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                // Skeleton loader
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-surface-container-highest/60 rounded w-3/4" />
                        <div className="h-3 bg-surface-container-highest/40 rounded w-1/2" />
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <td key={c} className="px-6 py-4">
                        <div className="h-4 bg-surface-container-highest/60 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredOfertas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="material-symbols-outlined text-5xl text-on-surface/20">local_offer</span>
                      <p className="text-on-surface/40 text-sm font-body">
                        {ofertas.length === 0
                          ? "No hay ofertas registradas. Crea la primera."
                          : "No se encontraron ofertas con estos filtros."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOfertas.map((oferta) => {
                  const isExpired = oferta.endDate && new Date(oferta.endDate) < new Date();

                  return (
                    <tr
                      key={oferta.id}
                      className={`hover:bg-surface-container-highest/20 transition-colors duration-150
                        ${!oferta.isActive || isExpired ? "opacity-70" : ""}`}
                    >
                      {/* Título y descripción */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-headline font-bold text-on-surface text-sm sm:text-base">
                            {oferta.title}
                          </span>
                          <span className="text-[11px] text-on-surface/50 font-body line-clamp-1 max-w-[280px]">
                            {oferta.description}
                          </span>
                        </div>
                      </td>

                      {/* Descuento */}
                      <td className="px-6 py-4 font-bold text-on-surface font-headline text-sm sm:text-base">
                        {oferta.discountType === "percentage"
                          ? `${oferta.discountValue}% DTO.`
                          : `S/. ${oferta.discountValue.toFixed(2)} DTO.`}
                      </td>

                      {/* Aplica A */}
                      <td className="px-6 py-4 text-on-surface/80">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-on-surface/40">
                              {oferta.targetType === "tags"
                                ? "tag"
                                : oferta.targetType === "category"
                                ? "category"
                                : "public"}
                            </span>
                            <span className="text-xs text-on-surface/60 font-semibold font-label capitalize tracking-wider">
                              {oferta.targetType === "all" ? "Todo el catálogo" : oferta.targetType}
                            </span>
                          </div>
                          {oferta.targetType === "tags" && oferta.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {oferta.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-mono px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/10 rounded text-on-surface/70"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {oferta.targetType === "category" && oferta.category && (
                            <span className="text-[11px] font-semibold text-on-surface/80">
                              {oferta.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Vigencia */}
                      <td className="px-6 py-4 text-xs font-mono text-on-surface/70">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-on-surface/40 font-label">
                              Inicio:
                            </span>
                            <span>{oferta.startDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-on-surface/40 font-label">
                              Vence:
                            </span>
                            <span className={isExpired ? "text-neutral-400 line-through" : ""}>
                              {oferta.endDate || "Indefinido"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block text-[9px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase border font-label
                            ${
                              isExpired
                                ? "bg-surface-container-highest text-neutral-400 border-outline-variant/10"
                                : oferta.isActive
                                ? "bg-neutral-800 text-neutral-100 border-neutral-700"
                                : "bg-surface-container-highest text-neutral-500 border-outline-variant/10"
                            }`}
                        >
                          {isExpired ? "Expirada" : oferta.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(oferta)}
                            title={oferta.isActive ? "Desactivar" : "Activar"}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 hover:bg-surface-container-highest transition-colors text-on-surface/60 hover:text-on-surface"
                          >
                            <span className="material-symbols-outlined text-base">
                              {oferta.isActive ? "block" : "check_circle"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(oferta)}
                            title="Editar"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 hover:bg-surface-container-highest transition-colors text-on-surface/60 hover:text-on-surface"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(oferta.id)}
                            title="Eliminar"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 hover:bg-red-950/40 transition-colors text-neutral-400 hover:text-red-300"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/80 backdrop-blur-md shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold font-headline uppercase tracking-wider">
                  {editingOferta ? "Editar Oferta" : "Nueva Oferta"}
                </h2>
                {!editingOferta && (
                  <p className="text-[10px] text-on-surface/40 font-body">
                    Se creará con estado <span className="font-bold text-neutral-400">Inactiva</span> por defecto.
                  </p>
                )}
              </div>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                disabled={isSaving}
                className="w-8 h-8 rounded-full hover:bg-surface-container-highest/60 flex items-center justify-center transition-colors text-on-surface/40 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 flex-grow">

              {/* title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                  <span className="text-on-surface/30 font-mono">title</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Oferta Black Friday"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all text-sm font-body"
                  required
                  disabled={isSaving}
                />
              </div>

              {/* description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                  <span className="text-on-surface/30 font-mono">description</span>
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe brevemente la campaña..."
                  rows={2}
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all text-sm font-body resize-none"
                  required
                  disabled={isSaving}
                />
              </div>

              {/* discountType & discountValue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label">
                    <span className="text-on-surface/30 font-mono">discountType</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                    disabled={isSaving}
                  >
                    <option value="percentage">percentage (%)</option>
                    <option value="money">money (S/.)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                    <span className="text-on-surface/30 font-mono">discountValue</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 text-xs font-bold">
                      {discountType === "percentage" ? "%" : "S/."}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discountValue}
                      onChange={(e) => {
                        // Solo permitir dígitos, un punto decimal y no más de 2 decimales
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                          setDiscountValue(val);
                        }
                      }}
                      placeholder="Ej. 25"
                      className="w-full bg-surface-container-highest border-none pl-8 pr-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface placeholder:text-on-surface/20 outline-none transition-all text-sm font-body"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              {/* targetType */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label">
                  <span className="text-on-surface/30 font-mono">targetType</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "category", "tags"] as TargetType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTargetType(type)}
                      disabled={isSaving}
                      className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5
                        ${targetType === type
                          ? "bg-neutral-800 text-neutral-100 border-neutral-600"
                          : "bg-surface-container-highest text-on-surface/50 border-outline-variant/10 hover:text-on-surface"}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {type === "tags" ? "tag" : type === "category" ? "category" : "public"}
                      </span>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* tags (solo si targetType === 'tags') */}
              {targetType === "tags" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                    <span className="text-on-surface/30 font-mono">tags</span>
                    <span className="text-red-400">*</span>
                    <span className="text-on-surface/30 normal-case font-normal ml-1">
                      — Selecciona los que aplican
                    </span>
                  </label>
                  {tagsDisponibles.length === 0 ? (
                    <p className="text-xs text-on-surface/40 italic px-1">
                      No hay tags disponibles en Firestore.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-surface-container-highest rounded-xl">
                      {tagsDisponibles.map((tag) => {
                        const isSelected = selectedTags.includes(tag.nombre);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.nombre)}
                            disabled={isSaving}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all select-none
                              ${isSelected
                                ? "bg-neutral-700 text-neutral-100 border-neutral-600"
                                : "bg-surface-container-low text-on-surface/50 border-outline-variant/10 hover:text-on-surface/80"}`}
                          >
                            #{tag.nombre}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedTags.length > 0 && (
                    <p className="text-[10px] text-on-surface/40 ml-1">
                      Seleccionados: <span className="font-semibold text-on-surface/60">{selectedTags.join(", ")}</span>
                    </p>
                  )}
                </div>
              )}

              {/* category (solo si targetType === 'category') */}
              {targetType === "category" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                    <span className="text-on-surface/30 font-mono">category</span>
                    <span className="text-red-400">*</span>
                  </label>
                  {categorias.length === 0 ? (
                    <p className="text-xs text-on-surface/40 italic px-1">
                      No hay categorías disponibles en Firestore.
                    </p>
                  ) : (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                      disabled={isSaving}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.nombre}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Vigencia: startDate & endDate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                    <span className="text-on-surface/30 font-mono">startDate</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface/50 tracking-widest uppercase ml-1 font-label">
                    <span className="text-on-surface/30 font-mono">endDate</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-neutral-500/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2 bg-red-950/30 border border-red-800/30 rounded-xl px-4 py-3 text-xs text-red-300 font-body">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
                  {formError}
                </div>
              )}

              {/* Info: siempre inactiva */}
              <div className="flex items-start gap-2 bg-surface-container-highest/40 border border-outline-variant/10 rounded-xl px-4 py-3 text-[11px] text-on-surface/50 font-body">
                <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
                {editingOferta
                  ? "Al guardar, isActive se restablecerá a false. Actívala manualmente desde la tabla."
                  : "La oferta se guardará con isActive = false. Actívala manualmente desde la tabla cuando esté lista."}
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/10 text-on-surface/60 hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-highest border border-outline-variant/10 text-on-surface hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {isSaving ? "Guardando..." : editingOferta ? "Guardar Cambios" : "Crear Oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
