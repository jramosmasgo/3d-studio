"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategorias,
  getTags,
  getMateriales,
  createCategoria,
  updateCategoria,
  createTag,
  updateTag,
  createMaterial,
  updateMaterial,
  generateSlug,
  type Categoria,
  type Tag,
  type Material,
} from "@/lib/firebase/config-service";

// ── Tipos de pestaña ──────────────────────────────────────────────────────────

type TabType = "categorias" | "tags" | "materiales";
type ModalType = "categoria" | "tag" | "material";

// ── Componente de Skeleton para carga ─────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 animate-pulse">
      <div className="h-4 w-3/4 bg-surface-container-highest rounded-lg mb-3" />
      <div className="h-3 w-full bg-surface-container-highest/60 rounded mb-2" />
      <div className="h-3 w-2/3 bg-surface-container-highest/60 rounded mb-4" />
      <div className="flex justify-end gap-2 mt-6">
        <div className="h-7 w-20 bg-surface-container-highest rounded-lg" />
        <div className="h-7 w-16 bg-surface-container-highest rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-outline-variant/5 animate-pulse">
      <td className="p-4"><div className="h-4 w-24 bg-surface-container-highest rounded" /></td>
      <td className="p-4"><div className="h-3 w-28 bg-surface-container-highest/60 rounded" /></td>
      <td className="p-4"><div className="h-5 w-12 bg-surface-container-highest/40 rounded-full" /></td>
      <td className="p-4"><div className="flex justify-end gap-2"><div className="h-7 w-7 bg-surface-container-highest rounded-lg" /><div className="h-7 w-7 bg-surface-container-highest rounded-lg" /></div></td>
    </tr>
  );
}

// ── Componente de Toast ──────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: "success" | "error";
}

// ── Componente Principal ─────────────────────────────────────────────────────

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>("categorias");

  // Datos de Firestore
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);

  // Estado de carga y errores
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("categoria");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [abreviatura, setAbreviatura] = useState("");
  const [active, setActive] = useState(true);

  // ── Utilidad Toast ──────────────────────────────────────────────────────────

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Carga inicial de datos ──────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, tgs, mats] = await Promise.all([
        getCategorias(),
        getTags(),
        getMateriales(),
      ]);
      setCategorias(cats);
      setTags(tgs);
      setMateriales(mats);
    } catch (err) {
      console.error("Error cargando configuración:", err);
      showToast("Error al cargar los datos. Verifica tu conexión.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Abrir Modal para Crear ──────────────────────────────────────────────────

  const handleOpenCreate = (type: ModalType) => {
    setModalType(type);
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setAbreviatura("");
    setActive(true);
    setIsModalOpen(true);
  };

  // ── Abrir Modal para Editar ─────────────────────────────────────────────────

  const handleOpenEdit = (
    type: ModalType,
    item: Categoria | Tag | Material
  ) => {
    setModalType(type);
    setEditingId(item.id);
    setNombre(item.nombre);
    setActive(item.active);
    setDescripcion((item as Categoria).descripcion ?? "");
    setAbreviatura((item as Material).abreviatura ?? "");
    setIsModalOpen(true);
  };

  // ── Guardar (Crear o Actualizar) ────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const slug = generateSlug(nombre);

      if (modalType === "categoria") {
        const payload = { nombre, slug, descripcion, active };
        if (editingId) {
          await updateCategoria(editingId, payload);
          setCategorias((prev) =>
            prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
          );
          showToast("Categoría actualizada correctamente.", "success");
        } else {
          const nueva = await createCategoria(payload);
          setCategorias((prev) =>
            [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          showToast("Categoría creada correctamente.", "success");
        }
      } else if (modalType === "tag") {
        const payload = { nombre, slug, active };
        if (editingId) {
          await updateTag(editingId, payload);
          setTags((prev) =>
            prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
          );
          showToast("Tag actualizado correctamente.", "success");
        } else {
          const nuevo = await createTag(payload);
          setTags((prev) =>
            [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          showToast("Tag creado correctamente.", "success");
        }
      } else {
        const payload = { nombre, abreviatura, active };
        if (editingId) {
          await updateMaterial(editingId, payload);
          setMateriales((prev) =>
            prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m))
          );
          showToast("Material actualizado correctamente.", "success");
        } else {
          const nuevo = await createMaterial(payload);
          setMateriales((prev) =>
            [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          showToast("Material creado correctamente.", "success");
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error guardando:", err);
      showToast("Error al guardar. Intenta de nuevo.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Alternar Estado Activo ──────────────────────────────────────────────────

  const handleToggleActive = async (
    type: ModalType,
    id: string,
    current: boolean
  ) => {
    const newActive = !current;

    // Optimistic update
    if (type === "categoria") {
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
      );
    } else if (type === "tag") {
      setTags((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: newActive } : t))
      );
    } else {
      setMateriales((prev) =>
        prev.map((m) => (m.id === id ? { ...m, active: newActive } : m))
      );
    }

    try {
      if (type === "categoria") await updateCategoria(id, { active: newActive });
      else if (type === "tag") await updateTag(id, { active: newActive });
      else await updateMaterial(id, { active: newActive });

      showToast(
        newActive ? "Registro habilitado." : "Registro desactivado.",
        "success"
      );
    } catch (err) {
      console.error("Error toggling active:", err);
      // Revertir optimistic update
      if (type === "categoria") {
        setCategorias((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: current } : c))
        );
      } else if (type === "tag") {
        setTags((prev) =>
          prev.map((t) => (t.id === id ? { ...t, active: current } : t))
        );
      } else {
        setMateriales((prev) =>
          prev.map((m) => (m.id === id ? { ...m, active: current } : m))
        );
      }
      showToast("Error al cambiar el estado. Intenta de nuevo.", "error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all duration-300 animate-in slide-in-from-top-2
            ${toast.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-md"
              : "bg-red-500/10 text-red-400 border-red-500/20 backdrop-blur-md"}`}
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
            Configuración del Sitio
          </h1>
          <p className="text-on-surface/40 text-xs sm:text-sm font-body">
            Administra los valores paramétricos utilizados en el catálogo de impresión 3D.
          </p>
        </div>
        {!loading && (
          <button
            onClick={loadAll}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 border border-outline-variant/20 text-on-surface/40 hover:text-on-surface rounded-xl hover:bg-surface-container-highest transition-all"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Recargar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/10 gap-1 overflow-x-auto pb-px">
        {(
          [
            { key: "categorias", label: "Categorías", icon: "category" },
            { key: "tags", label: "Tags / Etiquetas", icon: "tag" },
            { key: "materiales", label: "Materiales", icon: "layers" },
          ] as { key: TabType; label: string; icon: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-4 font-label uppercase text-xs tracking-wider border-b-2 font-bold whitespace-nowrap transition-all duration-200
              ${activeTab === tab.key
                ? "border-primary-container text-white bg-primary-container/5"
                : "border-transparent text-on-surface/40 hover:text-on-surface hover:bg-surface-container-highest/20"}`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PANEL CATEGORÍAS ─────────────────────────────────────────────── */}
      {activeTab === "categorias" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-headline font-bold uppercase tracking-tight">
              Listado de Categorías
              {!loading && (
                <span className="ml-2 text-[11px] font-normal text-on-surface/30 tracking-normal">
                  ({categorias.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => handleOpenCreate("categoria")}
              className="flex items-center gap-2 bg-primary-container hover:brightness-110 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : categorias.length === 0
              ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface/10 mb-3">category</span>
                  <p className="text-on-surface/30 text-sm">No hay categorías aún. Crea la primera.</p>
                </div>
              )
              : categorias.map((cat) => (
                <div
                  key={cat.id}
                  className={`bg-surface-container-low p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4
                    ${cat.active ? "border-outline-variant/10" : "border-red-500/10 opacity-60"}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-headline font-bold text-base text-on-surface">
                        {cat.nombre}
                      </h3>
                      <span
                        className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border
                          ${cat.active
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                      >
                        {cat.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface/40 font-body leading-relaxed">
                      {cat.descripcion}
                    </p>
                    <code className="inline-block text-[10px] bg-surface-container-highest text-primary-container px-2 py-0.5 rounded font-mono">
                      /{cat.slug}
                    </code>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/5">
                    <button
                      onClick={() => handleToggleActive("categoria", cat.id, cat.active)}
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border transition-all
                        ${cat.active
                          ? "text-red-400 border-red-500/10 hover:bg-red-500/5"
                          : "text-green-400 border-green-500/10 hover:bg-green-500/5"}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {cat.active ? "block" : "check_circle"}
                      </span>
                      {cat.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => handleOpenEdit("categoria", cat)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-2 bg-surface-container-highest border border-outline-variant/10 text-on-surface/80 rounded-lg hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── PANEL TAGS ──────────────────────────────────────────────────── */}
      {activeTab === "tags" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-headline font-bold uppercase tracking-tight">
              Tags / Etiquetas
              {!loading && (
                <span className="ml-2 text-[11px] font-normal text-on-surface/30 tracking-normal">
                  ({tags.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => handleOpenCreate("tag")}
              className="flex items-center gap-2 bg-primary-container hover:brightness-110 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Tag
            </button>
          </div>

          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-highest/50">
                    <th className="p-4 text-[10px] font-label uppercase tracking-widest text-on-surface/40">Tag</th>
                    <th className="p-4 text-[10px] font-label uppercase tracking-widest text-on-surface/40">Slug</th>
                    <th className="p-4 text-[10px] font-label uppercase tracking-widest text-on-surface/40">Estado</th>
                    <th className="p-4 text-right text-[10px] font-label uppercase tracking-widest text-on-surface/40">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    : tags.length === 0
                    ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-on-surface/30 text-sm">
                          No hay tags aún. Crea el primero.
                        </td>
                      </tr>
                    )
                    : tags.map((tag) => (
                      <tr
                        key={tag.id}
                        className={`hover:bg-surface-container-highest/20 transition-colors text-sm
                          ${!tag.active && "opacity-60"}`}
                      >
                        <td className="p-4 font-bold text-on-surface">
                          <span className="text-on-surface/40 font-normal"># </span>{tag.nombre}
                        </td>
                        <td className="p-4">
                          <code className="font-mono text-primary-container text-xs">{tag.slug}</code>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border
                              ${tag.active
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                          >
                            {tag.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive("tag", tag.id, tag.active)}
                              className={`p-1.5 rounded-lg border transition-all
                                ${tag.active
                                  ? "text-red-400 border-red-500/10 hover:bg-red-500/10"
                                  : "text-green-400 border-green-500/10 hover:bg-green-500/10"}`}
                              title={tag.active ? "Desactivar" : "Activar"}
                            >
                              <span className="material-symbols-outlined text-base">
                                {tag.active ? "block" : "check_circle"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit("tag", tag)}
                              className="p-1.5 bg-surface-container-highest border border-outline-variant/10 text-on-surface/80 rounded-lg hover:text-on-surface transition-colors"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL MATERIALES ─────────────────────────────────────────────── */}
      {activeTab === "materiales" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-headline font-bold uppercase tracking-tight">
              Materiales de Filamento
              {!loading && (
                <span className="ml-2 text-[11px] font-normal text-on-surface/30 tracking-normal">
                  ({materiales.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => handleOpenCreate("material")}
              className="flex items-center gap-2 bg-primary-container hover:brightness-110 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo Material
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : materiales.length === 0
              ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-on-surface/10 mb-3">layers</span>
                  <p className="text-on-surface/30 text-sm">No hay materiales aún. Crea el primero.</p>
                </div>
              )
              : materiales.map((mat) => (
                <div
                  key={mat.id}
                  className={`bg-surface-container-low p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4
                    ${mat.active ? "border-outline-variant/10" : "border-red-500/10 opacity-60"}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-primary-container/10 border border-primary-container/20 text-primary-container font-mono px-2 py-0.5 rounded font-bold">
                        {mat.abreviatura}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border
                          ${mat.active
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                      >
                        {mat.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-sm text-on-surface leading-snug">
                      {mat.nombre}
                    </h3>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/5">
                    <button
                      onClick={() => handleToggleActive("material", mat.id, mat.active)}
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all
                        ${mat.active
                          ? "text-red-400 border-red-500/10 hover:bg-red-500/5"
                          : "text-green-400 border-green-500/10 hover:bg-green-500/5"}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {mat.active ? "block" : "check_circle"}
                      </span>
                      {mat.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => handleOpenEdit("material", mat)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 bg-surface-container-highest border border-outline-variant/10 text-on-surface/80 rounded-lg hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── MODAL COMPARTIDO ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !saving && setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-base font-bold font-headline uppercase tracking-wider">
                {editingId ? "Editar" : "Crear"}{" "}
                {modalType === "categoria"
                  ? "Categoría"
                  : modalType === "tag"
                  ? "Tag"
                  : "Material"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="text-on-surface/40 hover:text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={
                    modalType === "categoria"
                      ? "Ej. Modelismo Arquitectónico"
                      : modalType === "tag"
                      ? "Ej. Coleccionable"
                      : "Ej. PLA (Ácido Poliláctico)"
                  }
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-body disabled:opacity-50"
                  required
                  disabled={saving}
                />
                {nombre && (
                  <p className="text-[10px] text-on-surface/30 ml-1 font-mono">
                    slug: {generateSlug(nombre)}
                  </p>
                )}
              </div>

              {/* Descripción — solo para Categorías */}
              {modalType === "categoria" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe los tipos de productos en esta categoría..."
                    rows={3}
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-body resize-none disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
              )}

              {/* Abreviatura — solo para Materiales */}
              {modalType === "material" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Abreviatura
                  </label>
                  <input
                    type="text"
                    value={abreviatura}
                    onChange={(e) => setAbreviatura(e.target.value.toUpperCase())}
                    placeholder="Ej. PLA, ABS, PETG, TPU"
                    maxLength={10}
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-mono uppercase disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
              )}

              {/* Toggle Activo */}
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:after:bg-white" />
                  <span className="ml-3 text-xs font-bold uppercase tracking-wider text-on-surface/75">
                    {active ? "Habilitado" : "Deshabilitado"}
                  </span>
                </label>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/10 text-on-surface/60 hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  )}
                  {saving ? "Guardando…" : editingId ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
