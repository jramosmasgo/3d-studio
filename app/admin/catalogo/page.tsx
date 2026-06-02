"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { getCategorias, getTags, getMateriales, type Categoria, type Tag, type Material } from "@/lib/firebase/config-service";
import { getProducts, createProduct, updateProduct, type Product as FirestoreProduct } from "@/lib/firebase/products-service";
import { getAdmins, type Admin } from "@/lib/firebase/admins-service";

export interface ProductImage {
  url: string;
  es_principal: boolean;
  orden: number;
  alt_text: string;
}

export interface Product {
  id?: string;

  // Información principal
  name: string;
  description: string;

  // Precio
  price: number;

  // Clasificación
  categoryId: string;
  categoryName?: string;

  // Material de impresión
  material: string;

  // Estado de disponibilidad
  availability: boolean;

  // Imágenes (máx. 4 según el diseño)
  images: ProductImage[];

  // Tags separados por comas
  tags: string[];

  // Estado activo/inactivo
  isActive: boolean;

  // Fechas opcionales
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
}

// Datos de ejemplo iniciales mapeados a la nueva interfaz
const PRODUCTOS_MOCK: Product[] = [
  {
    id: "501",
    name: "Figura Articulada de Dragón - Impresión 3D",
    description: "Figura coleccionable totalmente articulada impresa en filamento de alta calidad. Ideal para decoración o regalo.",
    price: 24.99,
    categoryId: "12",
    categoryName: "Figuras y Coleccionables",
    tags: ["impresion-3d", "articulado", "dragon", "geek"],
    isActive: true,
    material: "PLA",
    availability: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop",
        es_principal: true,
        orden: 1,
        alt_text: "Vista general de la figura de dragón articulado impreso en 3D"
      }
    ],
    createdBy: "admin@studio3d.com"
  },
  {
    id: "502",
    name: "Lámpara de Luna Realista Recargable",
    description: "Lámpara decorativa texturizada con relieve lunar exacto. Incluye base de madera elegante y carga USB.",
    price: 45.00,
    categoryId: "14",
    categoryName: "Hogar y Decoración",
    tags: ["lampara", "luna", "iluminacion", "regalo"],
    isActive: true,
    material: "PETG / PLA",
    availability: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
        es_principal: true,
        orden: 1,
        alt_text: "Lámpara de luna encendida sobre base de madera"
      }
    ],
    createdBy: "admin@studio3d.com"
  },
  {
    id: "503",
    name: "Prototipo de Engranaje Helicoidal Técnico",
    description: "Pieza mecánica de alta precisión diseñada para soportar fricción y cargas medias de trabajo industrial.",
    price: 15.50,
    categoryId: "10",
    categoryName: "Piezas Técnicas",
    tags: ["mecanico", "engranaje", "ingenieria", "prototipo"],
    isActive: false,
    material: "ABS / Nylon",
    availability: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
        es_principal: true,
        orden: 1,
        alt_text: "Detalle de engranajes mecánicos en 3D"
      }
    ],
    createdBy: "admin@studio3d.com"
  }
];

export default function AdminCatalogoPage() {
  const { user, adminProfile } = useAuth();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados cargados dinámicamente de Firestore
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tagsDisponibles, setTagsDisponibles] = useState<Tag[]>([]);
  const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Estados de Filtros y Paginación
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const ITEMS_POR_PAGINA = 12;
  const [paginaActual, setPaginaActual] = useState(1);

  // Estados del Formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState(0);
  const [categoriaId, setCategoriaId] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [disponibilidad, setDisponibilidad] = useState(true);
  const [tagsInput, setTagsInput] = useState("");
  const [active, setActive] = useState(true);

  // Interfaz de Slot de Imagen para el Formulario
  interface ImagenSlot {
    url: string;
    es_principal: boolean;
    orden: number;
    alt_text: string;
    status: "idle" | "uploading" | "success" | "error";
    progress: number;
    errorMsg: string | null;
  }

  // Estado para las 4 imágenes
  const [slots, setSlots] = useState<ImagenSlot[]>([
    { url: "", es_principal: true, orden: 1, alt_text: "", status: "idle", progress: 0, errorMsg: null },
    { url: "", es_principal: false, orden: 2, alt_text: "", status: "idle", progress: 0, errorMsg: null },
    { url: "", es_principal: false, orden: 3, alt_text: "", status: "idle", progress: 0, errorMsg: null },
    { url: "", es_principal: false, orden: 4, alt_text: "", status: "idle", progress: 0, errorMsg: null },
  ]);

  const [pastingUrlIndex, setPastingUrlIndex] = useState<number | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Lista filtrada y paginada (client-side, sin llamadas extra a Firestore) ──
  const adminMap = Object.fromEntries(admins.map((a) => [a.id, `${a.name} ${a.surname}`]));

  const productosFiltrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    const matchBusqueda =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchCategoria = !filtroCategoria || p.categoryId === filtroCategoria;
    const matchTags =
      filtroTags.length === 0 ||
      filtroTags.every((t) => p.tags.includes(t));
    return matchBusqueda && matchCategoria && matchTags;
  });

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const productosPagina = productosFiltrados.slice(
    (paginaSegura - 1) * ITEMS_POR_PAGINA,
    paginaSegura * ITEMS_POR_PAGINA
  );

  // Resetear a página 1 cuando cambian los filtros
  const handleBusqueda = (val: string) => { setBusqueda(val); setPaginaActual(1); };
  const handleFiltroCategoria = (val: string) => { setFiltroCategoria(val); setPaginaActual(1); };
  const handleToggleFiltroTag = (tag: string) => {
    setFiltroTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPaginaActual(1);
  };


  // Cargar Productos, Categorías, Tags y Materiales desde Firestore
  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, tgs, mats, adms] = await Promise.all([
          getProducts(),
          getCategorias(),
          getTags(),
          getMateriales(),
          getAdmins(),
        ]);
        setProductos(prods as Product[]);
        const activeCats = cats.filter((c) => c.active !== false);
        const activeMats = mats.filter((m) => m.active !== false);
        setCategorias(activeCats);
        setTagsDisponibles(tgs.filter((t) => t.active !== false));
        setMaterialesDisponibles(activeMats);
        setAdmins(adms);
        if (activeCats.length > 0) {
          setCategoriaId(activeCats[0].id);
        }
        if (activeMats.length > 0) {
          setMaterial(activeMats[0].nombre);
        }
      } catch (err) {
        console.error("Error al cargar datos de Firestore:", err);
      } finally {
        setLoadingProductos(false);
      }
    }
    loadData();
  }, []);

  // Handlers para la Galería de Imágenes
  // Los archivos locales se guardan como blob:// para previsualización.
  // La subida a Cloudinary ocurre sólo al hacer click en Guardar (handleSave).
  const fileObjects = useRef<(File | null)[]>([null, null, null, null]);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Guardar referencia al archivo sin subir
    fileObjects.current[index] = file;
    // Crear URL de previsualización local
    const objectUrl = URL.createObjectURL(file);
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, url: objectUrl, status: "idle", progress: 0, errorMsg: null }
          : s
      )
    );
  };

  const handleDeleteSlot = (index: number) => {
    setSlots((prev) => {
      const updated = prev.map((s, i) =>
        i === index
          ? {
              ...s,
              url: "",
              status: "idle" as const,
              progress: 0,
              errorMsg: null,
              es_principal: false,
            }
          : s
      );

      // Si borramos la principal, reasignarla a la primera disponible con imagen
      const wasPrincipal = prev[index].es_principal;
      if (wasPrincipal) {
        const firstFilled = updated.findIndex((s) => s.url !== "");
        if (firstFilled !== -1) {
          updated[firstFilled].es_principal = true;
        } else {
          updated[0].es_principal = true;
        }
      }
      return updated;
    });
    // Limpiar input file
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const handleSetPrincipal = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => ({
        ...s,
        es_principal: i === index,
      }))
    );
  };

  const handleUpdateAltText = (index: number, text: string) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              alt_text: text,
            }
          : s
      )
    );
  };

  // Abrir modal para crear nuevo
  const handleOpenCreate = () => {
    setEditingProducto(null);
    setFormError(null);
    setNombre("");
    setDescripcion("");
    setPrecio(0);
    if (categorias.length > 0) {
      setCategoriaId(categorias[0].id);
    } else {
      setCategoriaId("");
    }
    if (materialesDisponibles.length > 0) {
      setMaterial(materialesDisponibles[0].nombre);
    } else {
      setMaterial("PLA");
    }
    setDisponibilidad(true);
    setTagsInput("");
    fileObjects.current = [null, null, null, null];
    setSlots([
      { url: "", es_principal: true, orden: 1, alt_text: "", status: "idle", progress: 0, errorMsg: null },
      { url: "", es_principal: false, orden: 2, alt_text: "", status: "idle", progress: 0, errorMsg: null },
      { url: "", es_principal: false, orden: 3, alt_text: "", status: "idle", progress: 0, errorMsg: null },
      { url: "", es_principal: false, orden: 4, alt_text: "", status: "idle", progress: 0, errorMsg: null },
    ]);
    setActive(true);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (producto: Product) => {
    setEditingProducto(producto);
    setFormError(null);
    setNombre(producto.name);
    setDescripcion(producto.description);
    setPrecio(producto.price);
    setCategoriaId(producto.categoryId);
    setMaterial(producto.material);
    setDisponibilidad(producto.availability);
    setTagsInput(producto.tags.join(", "));
    
    const existingImgs = [...producto.images].sort((a, b) => a.orden - b.orden);
    const newSlots = Array.from({ length: 4 }, (_, i) => {
      const img = existingImgs[i];
      return {
        url: img?.url || "",
        es_principal: img?.es_principal ?? (i === 0),
        orden: img?.orden ?? (i + 1),
        alt_text: img?.alt_text || "",
        status: (img?.url ? "success" : "idle") as "idle" | "success",
        progress: img?.url ? 100 : 0,
        errorMsg: null as string | null
      };
    });

    if (!newSlots.some(s => s.url && s.es_principal)) {
      const firstFilledIndex = newSlots.findIndex(s => s.url);
      if (firstFilledIndex !== -1) {
        newSlots[firstFilledIndex].es_principal = true;
      } else {
        newSlots[0].es_principal = true;
      }
    }

    setSlots(newSlots);
    setActive(producto.isActive);
    setIsModalOpen(true);
  };

  // Alternar estado activo/desactivado rápido (escribe en Firestore)
  const handleToggleActive = async (id: string | undefined) => {
    if (!id) return;
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;
    const newValue = !producto.isActive;
    // Actualizar estado local de inmediato (optimistic update)
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: newValue } : p))
    );
    try {
      await updateProduct(id, { isActive: newValue });
    } catch (err) {
      console.error("Error al cambiar estado del producto:", err);
      // Revertir en caso de error
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !newValue } : p))
      );
    }
  };

  // Agregar/Remover un tag de manera rápida usando los badges premium
  const handleToggleTag = (tagName: string) => {
    const cleanTag = tagName.trim().toLowerCase();
    const currentTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (currentTags.includes(cleanTag)) {
      // Remover
      const filtered = currentTags.filter((t) => t !== cleanTag);
      setTagsInput(filtered.join(", "));
    } else {
      // Agregar
      currentTags.push(cleanTag);
      setTagsInput(currentTags.join(", "));
    }
  };

  // Guardar (Agregar / Actualizar) — async: valida → sube imágenes pendientes → escribe en Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar campos obligatorios (todos excepto tags)
    if (!nombre.trim() || !descripcion.trim() || precio <= 0 || !categoriaId || !material) {
      setFormError("Todos los campos son obligatorios (nombre, descripción, precio mayor a 0, categoría y material) a excepción de las etiquetas.");
      return;
    }

    // 2. Validar que al menos haya un slot con imagen (blob o URL ya subida)
    const slotsConImagen = slots.filter((s) => s.url.trim() !== "");
    if (slotsConImagen.length === 0) {
      setFormError("Es obligatorio subir al menos una foto para registrar el producto.");
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      // 3. Subir a Cloudinary los slots que aún son blobs (archivo local pendiente)
      const finalSlots = await Promise.all(
        slots.map(async (slot, index) => {
          // Slot vacío: ignorar
          if (!slot.url.trim()) return slot;
          // Ya es una URL remota (fue pegada o editada con URL existente)
          if (!slot.url.startsWith("blob:")) return { ...slot, status: "success" as const };
          // Es un blob → hay un File pendiente: subir ahora
          const file = fileObjects.current[index];
          if (!file) return { ...slot, status: "error" as const, errorMsg: "Archivo perdido" };

          // Mostrar estado uploading en UI
          setSlots((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: "uploading" as const, progress: 20 } : s
            )
          );

          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "catalogo");

          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Error al subir la imagen.");

          // Actualizar slot con URL definitiva de Cloudinary
          URL.revokeObjectURL(slot.url);
          setSlots((prev) =>
            prev.map((s, i) =>
              i === index
                ? { ...s, url: data.url, status: "success" as const, progress: 100 }
                : s
            )
          );
          fileObjects.current[index] = null;
          return { ...slot, url: data.url, status: "success" as const };
        })
      );

      // 4. Construir lista de imágenes finales
      let activeImages: ProductImage[] = finalSlots
        .filter((s) => s.url.trim() !== "" && s.status !== "error")
        .map((s, index) => ({
          url: s.url,
          es_principal: s.es_principal,
          orden: index + 1,
          alt_text: s.alt_text || `Imagen descriptiva ${index + 1} de ${nombre}`,
        }));

      if (activeImages.length === 0) {
        setFormError("No se pudo subir ninguna imagen. Intenta de nuevo.");
        setIsSaving(false);
        return;
      }

      // Garantizar que haya una imagen principal
      if (!activeImages.some((img) => img.es_principal)) {
        activeImages[0].es_principal = true;
      }

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const categoriaNombre =
        categorias.find((c) => c.id === categoriaId)?.nombre || "Otros";

      // 5. Escribir en Firestore
      if (editingProducto && editingProducto.id) {
        const updates: Partial<FirestoreProduct> = {
          name: nombre,
          description: descripcion,
          price: Number(precio),
          categoryId: categoriaId,
          categoryName: categoriaNombre,
          material,
          availability: disponibilidad,
          tags: tagsArray,
          isActive: active,
          images: activeImages,
        };
        await updateProduct(editingProducto.id, updates);
        setProductos((prev) =>
          prev.map((p) =>
            p.id === editingProducto.id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          )
        );
      } else {
        const newProduct: Omit<FirestoreProduct, "id"> = {
          name: nombre,
          description: descripcion,
          price: Number(precio),
          categoryId: categoriaId,
          categoryName: categoriaNombre,
          material,
          availability: disponibilidad,
          tags: tagsArray,
          isActive: active,
          images: activeImages,
          createdBy: adminProfile?.id || user?.uid || "desconocido",
        };
        const created = await createProduct(newProduct);
        setProductos((prev) => [created as Product, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Error desconocido al guardar.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold font-headline tracking-tighter uppercase">
            Catálogo de Productos
          </h1>
          <p className="text-on-surface/40 text-xs sm:text-sm font-body">
            Agrega, edita, optimiza o desactiva las creaciones de tu catálogo.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-container hover:brightness-110 text-white font-bold uppercase tracking-wider text-xs px-6 py-4 rounded-xl shadow-lg shadow-primary-container/20 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Producto
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros de Categoría / Tags */}
      <div className="bg-surface-container-low p-4 sm:p-5 rounded-2xl border border-outline-variant/10 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg">
              search
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción de producto..."
              className="w-full bg-surface-container-highest border-none pl-11 pr-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/30 outline-none transition-all text-xs sm:text-sm font-body"
            />
          </div>

          {/* Selector de Categorías */}
          <div className="w-full md:w-64 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg">
              category
            </span>
            <select
              value={filtroCategoria}
              onChange={(e) => handleFiltroCategoria(e.target.value)}
              className="w-full bg-surface-container-highest border-none pl-11 pr-10 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none transition-all text-xs sm:text-sm font-body cursor-pointer appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>

        {/* Filtro por Tags */}
        {tagsDisponibles.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-1">
            <span className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label whitespace-nowrap">
              Filtrar por Tags:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
              {tagsDisponibles.map((tag) => {
                const isActive = filtroTags.includes(tag.nombre);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleFiltroTag(tag.nombre)}
                    className={`text-[9px] px-2.5 py-1 rounded-md border font-semibold transition-all select-none
                      ${isActive
                        ? "bg-primary-container/20 text-primary-container border-primary-container/40"
                        : "bg-surface-container-highest text-on-surface/50 border-outline-variant/10 hover:text-on-surface/80 hover:bg-surface-container-highest/80"}`}
                  >
                    #{tag.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid de Productos - Totalmente Adaptativo */}
      {loadingProductos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-xl animate-pulse">
              <div className="w-full aspect-video bg-surface-container-highest/60" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-surface-container-highest/60 rounded-lg w-3/4" />
                <div className="h-3 bg-surface-container-highest/40 rounded-lg w-full" />
                <div className="h-3 bg-surface-container-highest/40 rounded-lg w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {productos.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface/20">inventory_2</span>
              <p className="text-on-surface/40 text-sm font-body">No hay productos registrados todavía.</p>
              <p className="text-on-surface/25 text-xs font-body">Crea el primero con el botón &quot;Nuevo Producto&quot;.</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface/20">search_off</span>
              <p className="text-on-surface/40 text-sm font-body">No se encontraron productos con estos filtros.</p>
              <button
                type="button"
                onClick={() => { setBusqueda(""); setFiltroCategoria(""); setFiltroTags([]); setPaginaActual(1); }}
                className="text-xs text-primary-container hover:underline font-semibold"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            productosPagina.map((producto) => (
              <div
                key={producto.id}
                className={`group bg-surface-container-low rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-lg
                  ${producto.isActive 
                    ? "border-outline-variant/10 hover:border-primary-container/30" 
                    : "border-red-500/10 opacity-70 filter grayscale-[20%]"}`}
              >
                {/* Imagen Header Compacta */}
                <div className="relative w-full aspect-[16/10] bg-surface-container-highest flex items-center justify-center overflow-hidden">
                  {producto.images[0]?.url ? (
                    <Image
                      src={producto.images[0].url}
                      alt={producto.images[0].alt_text || producto.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-on-surface/20">image</span>
                  )}
                  {/* Badge de Categoría */}
                  <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-[9px] font-bold text-white px-2 py-0.5 rounded-full tracking-wider uppercase border border-white/5">
                    {producto.categoryName}
                  </span>
                  {/* Badge de Activo/Inactivo */}
                  <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase border backdrop-blur-md
                    ${producto.isActive
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                  >
                    {producto.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Contenido / Cuerpo Compacto */}
                <div className="p-3.5 space-y-3 flex-grow">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-headline font-bold text-sm text-on-surface line-clamp-1" title={producto.name}>
                        {producto.name}
                      </h3>
                      <span className="font-headline font-bold text-primary-container text-sm whitespace-nowrap">
                        S/. {producto.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface/50 font-body line-clamp-2">
                      {producto.description}
                    </p>
                  </div>

                  {/* Especificaciones técnicas rápidas compactas */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-surface-container-highest/30 p-2 rounded-lg border border-outline-variant/5">
                    <div className="truncate">
                      <span className="text-on-surface/40 block font-label uppercase text-[8px] tracking-wider">Material</span>
                      <span className="font-semibold text-on-surface/75 truncate block">{producto.material}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-on-surface/40 block font-label uppercase text-[8px] tracking-wider">Disponibilidad</span>
                      <span className="font-semibold text-on-surface/75 truncate block">
                        {producto.availability ? "Stock" : "Bajo pedido"}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {producto.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {producto.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[8px] bg-surface-container-highest text-on-surface/40 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                      {producto.tags.length > 3 && (
                        <span className="text-[8px] text-on-surface/30 px-1 py-0.5">
                          +{producto.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Registrado por */}
                  <div className="flex items-center gap-1 pt-2 border-t border-outline-variant/5 text-[9px] text-on-surface/35">
                    <span className="material-symbols-outlined text-[11px]">person</span>
                    <span className="truncate">
                      Reg. por: <span className="font-medium text-on-surface/55">{adminMap[producto.createdBy] || producto.createdBy || "Desconocido"}</span>
                    </span>
                  </div>
                </div>

                {/* Acciones Compactas */}
                <div className="px-3.5 py-2.5 bg-surface-container-highest/20 border-t border-outline-variant/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(producto.id)}
                    className={`flex-grow flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider py-1.5 rounded-md border transition-all
                      ${producto.isActive
                        ? "text-red-400 border-red-500/10 hover:bg-red-500/10"
                        : "text-green-400 border-green-500/10 hover:bg-green-500/10"}`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {producto.isActive ? "block" : "check_circle"}
                    </span>
                    {producto.isActive ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(producto)}
                    className="flex-grow flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider py-1.5 bg-surface-container-highest text-on-surface/80 hover:text-on-surface border border-outline-variant/10 rounded-md hover:bg-surface-container-highest/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">edit</span>
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Paginación Visual Premium */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/60 border border-outline-variant/10 px-6 py-4 rounded-2xl shadow-md">
        {/* Info de Página */}
        <span className="text-xs text-on-surface/40 font-body">
          Mostrando{" "}
          <strong className="text-on-surface/70 font-semibold">
            {productosFiltrados.length === 0 ? 0 : (paginaSegura - 1) * ITEMS_POR_PAGINA + 1}
          </strong>
          {" "}a{" "}
          <strong className="text-on-surface/70 font-semibold">
            {Math.min(paginaSegura * ITEMS_POR_PAGINA, productosFiltrados.length)}
          </strong>
          {" "}de{" "}
          <strong className="text-on-surface/70 font-semibold">{productosFiltrados.length}</strong>
          {" "}producto{productosFiltrados.length !== 1 ? "s" : ""}
          {productosFiltrados.length !== productos.length && (
            <span className="text-on-surface/30"> (filtrados de {productos.length})</span>
          )}
        </span>

        {/* Controladores de Página */}
        <div className="flex items-center gap-2">
          {/* Anterior */}
          <button
            type="button"
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaSegura <= 1}
            className="w-9 h-9 rounded-xl border border-outline-variant/10 bg-surface-container-highest/20 hover:bg-surface-container-highest hover:text-on-surface text-on-surface/40 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          {/* Números de Páginas */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => {
                // Mostrar max 5 páginas centradas en la actual
                if (totalPaginas <= 5) return true;
                if (n === 1 || n === totalPaginas) return true;
                return Math.abs(n - paginaSegura) <= 1;
              })
              .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === "number" && (n as number) - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(n);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-on-surface/30">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPaginaActual(item as number)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all
                      ${paginaSegura === item
                        ? "bg-primary-container text-white shadow-md shadow-primary-container/20"
                        : "border border-outline-variant/10 bg-surface-container-highest/10 hover:bg-surface-container-highest text-on-surface/65 hover:text-on-surface"}`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          {/* Siguiente */}
          <button
            type="button"
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura >= totalPaginas}
            className="w-9 h-9 rounded-xl border border-outline-variant/10 bg-surface-container-highest/20 hover:bg-surface-container-highest hover:text-on-surface text-on-surface/40 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Modal - Agregar / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Caja del Modal */}
          <div className="relative z-10 w-full max-w-3xl bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header del Modal */}
            <div className="px-8 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/80 backdrop-blur-md">
              <h2 className="text-xl font-bold font-headline uppercase tracking-tight">
                {editingProducto ? "Actualizar Producto" : "Agregar Nuevo Producto"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-highest/60 flex items-center justify-center transition-colors text-on-surface/40 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="overflow-y-auto p-8 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lado Izquierdo: Datos Básicos */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Artoy articulado"
                      className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                        Precio (S/.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={precio || ""}
                        onChange={(e) => setPrecio(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                        Categoría
                      </label>
                      <select
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                      >
                        {categorias.length === 0 ? (
                          <option value="">Cargando categorías...</option>
                        ) : (
                          categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                      Descripción
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Detalles sobre las dimensiones, proceso e historia..."
                      rows={4}
                      className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Lado Derecho: Especificaciones + Imagen */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                        Material de Impresión
                      </label>
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer"
                      >
                        {materialesDisponibles.length === 0 ? (
                          <option value="">Cargando materiales...</option>
                        ) : (
                          materialesDisponibles.map((mat) => (
                            <option key={mat.id} value={mat.nombre}>
                              {mat.nombre} {mat.abreviatura ? `(${mat.abreviatura})` : ""}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                        Disponibilidad (Stock)
                      </label>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={disponibilidad}
                            onChange={(e) => setDisponibilidad(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:after:bg-white" />
                          <span className="ml-3 text-xs font-bold uppercase tracking-wider text-on-surface/75">
                            {disponibilidad ? "Stock Inmediato" : "Bajo Pedido"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Galería de Imágenes (Hasta 4) */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label block">
                        Galería de Imágenes (Máx. 4)
                      </label>
                      <span className="text-[10px] text-on-surface/40 font-body ml-1 block">
                        Selecciona la estrella para definir la imagen principal del catálogo.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {slots.map((slot, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className={`relative aspect-square rounded-xl border border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center
                              ${
                                slot.url
                                  ? slot.es_principal
                                    ? "border-primary-container bg-surface-container-highest ring-1 ring-primary-container"
                                    : "border-outline-variant/30 bg-surface-container-highest"
                                  : "border-outline-variant/20 bg-surface-container-highest/30 hover:border-primary-container/40 hover:bg-surface-container-highest/60"
                              }`}
                          >
                            {/* Input de archivo oculto */}
                            <input
                              type="file"
                              ref={(el) => {
                                fileInputRefs.current[index] = el;
                              }}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(index, e)}
                            />

                            {/* Mostrar Imagen */}
                            {slot.url ? (
                              <div className="relative w-full h-full group/image">
                                <Image
                                  src={slot.url}
                                  alt={slot.alt_text || `Imagen ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized={slot.url.startsWith("blob:")}
                                />

                                {/* Indicador de Principal */}
                                {slot.es_principal && (
                                  <div className="absolute top-1.5 left-1.5 bg-primary-container text-white px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 shadow-md shadow-primary-container/30">
                                    <span className="material-symbols-outlined text-[10px]">star</span>
                                    Principal
                                  </div>
                                )}

                                {/* Overlay de Acciones al hacer Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  {!slot.es_principal && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrincipal(index)}
                                      title="Establecer como principal"
                                      className="w-8 h-8 rounded-lg bg-yellow-500/90 text-black hover:bg-yellow-400 flex items-center justify-center transition-colors shadow"
                                    >
                                      <span className="material-symbols-outlined text-lg">star</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSlot(index)}
                                    title="Eliminar imagen"
                                    className="w-8 h-8 rounded-lg bg-red-500/90 text-white hover:bg-red-400 flex items-center justify-center transition-colors shadow"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ) : pastingUrlIndex === index ? (
                              /* Estado de pegado de URL externo */
                              <div className="flex flex-col items-center justify-center p-2 text-center gap-2 w-full h-full bg-surface-container-highest/90">
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={tempUrl}
                                  onChange={(e) => setTempUrl(e.target.value)}
                                  className="w-full bg-surface-container-low border border-outline-variant/20 px-2 py-1 rounded text-[10px] text-on-surface outline-none focus:ring-1 focus:ring-primary-container"
                                  autoFocus
                                />
                                <div className="flex gap-1 w-full">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (tempUrl.trim()) {
                                        setSlots((prev) =>
                                          prev.map((s, i) =>
                                            i === index
                                              ? { ...s, url: tempUrl, status: "success" as const }
                                              : s
                                          )
                                        );
                                      }
                                      setPastingUrlIndex(null);
                                      setTempUrl("");
                                    }}
                                    className="flex-1 bg-primary-container hover:brightness-115 text-white text-[9px] font-bold py-1 rounded uppercase tracking-wider"
                                  >
                                    OK
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPastingUrlIndex(null);
                                      setTempUrl("");
                                    }}
                                    className="flex-1 bg-surface-container-low text-on-surface/60 text-[9px] font-bold py-1 rounded border border-outline-variant/10"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Estado Vacío de Slot (Drag/Drop/Click) */
                              <div className="flex flex-col items-center justify-center text-center p-2 w-full h-full cursor-pointer hover:scale-[1.02] transition-transform">
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[index]?.click()}
                                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/10 text-primary-container hover:scale-105 transition-transform"
                                >
                                  <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                                </button>
                                <span className="text-[9px] font-bold text-on-surface/40 mt-1">Subir</span>
                                <button
                                  type="button"
                                  onClick={() => setPastingUrlIndex(index)}
                                  className="text-[8px] text-primary-container/80 hover:text-primary-container font-semibold mt-1 border-t border-outline-variant/5 pt-1 w-full"
                                >
                                  Pegar URL
                                </button>
                              </div>
                            )}

                            {/* Barra de progreso de subida individual */}
                            {slot.status === "uploading" && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-primary-container animate-spin">
                                  progress_activity
                                </span>
                                <span className="text-[8px] text-white font-bold">{slot.progress}%</span>
                                <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary-container transition-all duration-200"
                                    style={{ width: `${slot.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Mensaje de error de subida individual */}
                            {slot.status === "error" && (
                              <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-2 text-center">
                                <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                                <span className="text-[8px] text-red-300 font-bold leading-tight line-clamp-2 mt-0.5">
                                  {slot.errorMsg || "Error al subir"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSlots((prev) =>
                                      prev.map((s, i) =>
                                        i === index
                                          ? {
                                              ...s,
                                              status: "idle" as const,
                                              progress: 0,
                                              errorMsg: null,
                                            }
                                          : s
                                      )
                                    );
                                  }}
                                  className="mt-1 bg-red-800 text-white text-[8px] px-1.5 py-0.5 rounded font-bold"
                                >
                                  Reintentar
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Campo Alt Text del Slot */}
                          {slot.url && (
                            <input
                              type="text"
                              value={slot.alt_text}
                              onChange={(e) => handleUpdateAltText(index, e.target.value)}
                              placeholder="Texto descriptivo SEO..."
                              className="w-full bg-surface-container-highest/40 border border-outline-variant/10 px-2 py-1.5 rounded-lg text-[9px] text-on-surface placeholder:text-on-surface/30 outline-none focus:ring-1 focus:ring-primary-container/50 transition-all"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campo de Tags e Integración Premium con Tags de Firebase */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                      Etiquetas / Tags (separados por comas)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="impresion-3d, dragon, decoracion"
                      className="w-full bg-surface-container-highest border-none px-4 py-3.5 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body"
                    />

                    {/* Premium Clickable Badges de Firestore */}
                    {tagsDisponibles.length > 0 && (
                      <div className="space-y-1 pt-1 ml-1">
                        <span className="text-[9px] font-semibold text-on-surface/40 uppercase tracking-wider block">
                          Sugeridos de la Base de Datos:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {tagsDisponibles.map((tag) => {
                            const isSelected = tagsInput
                              .split(",")
                              .map((t) => t.trim().toLowerCase())
                              .includes(tag.nombre.toLowerCase());
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleToggleTag(tag.nombre)}
                                className={`text-[10px] px-2.5 py-1 rounded-md border font-semibold transition-all select-none
                                  ${
                                    isSelected
                                      ? "bg-primary-container/20 text-primary-container border-primary-container/40"
                                      : "bg-surface-container-highest text-on-surface/50 border-outline-variant/10 hover:text-on-surface/80"
                                  }`}
                              >
                                {tag.nombre}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toggle de Estado */}
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:after:bg-white" />
                      <span className="ml-3 text-xs font-bold uppercase tracking-wider text-on-surface/75">
                        {active ? "Producto Disponible (Activo)" : "Producto Oculto (Desactivado)"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bloque de Error de Validación */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Botones de Acción Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-6 py-3.5 rounded-xl border border-outline-variant/10 text-on-surface/60 hover:text-on-surface text-xs font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3.5 rounded-xl bg-primary-container hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Guardando...
                    </>
                  ) : (
                    editingProducto ? "Guardar Cambios" : "Crear Producto"
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
