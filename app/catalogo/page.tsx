"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/Footer";
import {
  getProducts,
  type Product,
} from "@/lib/firebase/products-service";
import {
  getCategorias,
  getTags,
  getMateriales,
  type Categoria,
  type Tag,
  type Material,
} from "@/lib/firebase/config-service";
import { getOfertas, type Oferta } from "@/lib/firebase/ofertas-service";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

function CatalogoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  // ── Datos de Firebase ───────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [activeOffer, setActiveOffer] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para obtener precio con descuento aplicado
  const getDiscountedPrice = useCallback((product: Product, offer: Oferta | null) => {
    if (!offer || !offer.isActive) {
      return { discountedPrice: product.price, hasDiscount: false };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (offer.startDate && todayStr < offer.startDate) {
      return { discountedPrice: product.price, hasDiscount: false };
    }
    if (offer.endDate && todayStr > offer.endDate) {
      return { discountedPrice: product.price, hasDiscount: false };
    }

    let applies = false;
    if (offer.targetType === "all") {
      applies = true;
    } else if (offer.targetType === "category" && offer.category) {
      applies = product.categoryName?.toLowerCase() === offer.category.toLowerCase();
    } else if (offer.targetType === "tags" && offer.tags && offer.tags.length > 0) {
      applies = product.tags.some((t) => offer.tags.includes(t));
    }

    if (applies) {
      if (offer.discountType === "percentage") {
        const discount = product.price * (offer.discountValue / 100);
        return { discountedPrice: Math.max(0, product.price - discount), hasDiscount: true };
      } else if (offer.discountType === "money") {
        return { discountedPrice: Math.max(0, product.price - offer.discountValue), hasDiscount: true };
      }
    }

    return { discountedPrice: product.price, hasDiscount: false };
  }, []);

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [tagsSeleccionados, setTagsSeleccionados] = useState<string[]>([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<number>(500);
  const [precioMaxDato, setPrecioMaxDato] = useState<number>(500);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [ordenar, setOrdenar] = useState<SortOption>("featured");

  // ── Paginación ──────────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 9;

  // ── UI ──────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sincronizar parámetro de búsqueda de la URL
  useEffect(() => {
    setBusqueda(queryParam);
    setPagina(1);
  }, [queryParam]);

  // ── Cargar datos ────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [prods, cats, tgs, mats, offers] = await Promise.all([
          getProducts(),
          getCategorias(),
          getTags(),
          getMateriales(),
          getOfertas(),
        ]);
        const activos = prods.filter((p) => p.isActive);
        setProducts(activos);
        setCategorias(cats.filter((c) => c.active !== false));
        setTags(tgs.filter((t) => t.active !== false));
        setMateriales(mats.filter((m) => m.active !== false));
        
        const active = offers.find((o) => o.isActive) || null;
        setActiveOffer(active);

        // Calcular precio máximo real basándose en el precio con descuento si aplica
        const max = activos.reduce((acc, p) => {
          const { discountedPrice } = getDiscountedPrice(p, active);
          return Math.max(acc, discountedPrice);
        }, 0);
        const roundedMax = Math.ceil(max / 50) * 50 || 500;
        setPrecioMaxDato(roundedMax);
        setPrecioMax(roundedMax);
      } catch (err) {
        console.error("Error al cargar catálogo:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getDiscountedPrice]);

  // ── Toggle tag ──────────────────────────────────────────────────────────
  const toggleTag = useCallback((tag: string) => {
    setTagsSeleccionados((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPagina(1);
  }, []);

  // ── Limpiar filtros ─────────────────────────────────────────────────────
  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSeleccionada("");
    setTagsSeleccionados([]);
    setMaterialSeleccionado("");
    setPrecioMax(precioMaxDato);
    setSoloDisponibles(false);
    setOrdenar("featured");
    setPagina(1);
    router.push("/catalogo");
  };

  // ── Productos filtrados ─────────────────────────────────────────────────
  const productosFiltrados = useMemo(() => {
    let result = [...products];

    // Búsqueda
    const q = busqueda.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Categoría
    if (categoriaSeleccionada) {
      result = result.filter((p) => p.categoryId === categoriaSeleccionada);
    }

    // Tags (debe tener todos los seleccionados)
    if (tagsSeleccionados.length > 0) {
      result = result.filter((p) =>
        tagsSeleccionados.every((t) => p.tags.includes(t))
      );
    }

    // Material
    if (materialSeleccionado) {
      result = result.filter((p) =>
        p.material.toLowerCase().includes(materialSeleccionado.toLowerCase())
      );
    }

    // Precio (usar precio descontado para el filtro si aplica)
    result = result.filter((p) => {
      const { discountedPrice } = getDiscountedPrice(p, activeOffer);
      return discountedPrice <= precioMax;
    });

    // Solo disponibles
    if (soloDisponibles) {
      result = result.filter((p) => p.availability);
    }

    // Ordenar
    switch (ordenar) {
      case "price-asc":
        result.sort((a, b) => {
          const priceA = getDiscountedPrice(a, activeOffer).discountedPrice;
          const priceB = getDiscountedPrice(b, activeOffer).discountedPrice;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        result.sort((a, b) => {
          const priceA = getDiscountedPrice(a, activeOffer).discountedPrice;
          const priceB = getDiscountedPrice(b, activeOffer).discountedPrice;
          return priceB - priceA;
        });
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [
    products,
    busqueda,
    categoriaSeleccionada,
    tagsSeleccionados,
    materialSeleccionado,
    precioMax,
    soloDisponibles,
    ordenar,
    activeOffer,
    getDiscountedPrice,
  ]);

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const productosPagina = productosFiltrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  const hayFiltrosActivos =
    busqueda ||
    categoriaSeleccionada ||
    tagsSeleccionados.length > 0 ||
    materialSeleccionado ||
    precioMax < precioMaxDato ||
    soloDisponibles;

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />

      <main className="pt-40 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-4 font-headline uppercase">
            Catálogo
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <p className="max-w-xl text-on-surface/60 text-base font-body">
              Figuras coleccionables de alta precisión, estatuas de resina y
              piezas articuladas impresas con excelencia en manufactura aditiva.
            </p>
            {/* Ordenar – desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
                Ordenar
              </span>
              <div className="relative">
                <select
                  value={ordenar}
                  onChange={(e) => {
                    setOrdenar(e.target.value as SortOption);
                    setPagina(1);
                  }}
                  className="bg-surface-container-high border-none text-sm font-medium py-2 pl-4 pr-10 rounded-md focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="name-asc">Nombre A–Z</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-on-surface/50">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Indicador de Búsqueda Activa (si existe en la URL) ─────────── */}
        {busqueda && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-on-surface/50 font-body">Mostrando resultados para:</span>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-md text-xs font-semibold">
              <span>"{busqueda}"</span>
              <button
                onClick={() => {
                  setBusqueda("");
                  setPagina(1);
                  router.push("/catalogo");
                }}
                className="hover:text-primary/70 transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Barra de filtros/ordenar para dispositivos móviles ─────────── */}
        <div className="flex gap-3 mb-8 items-center lg:hidden">
          {/* Botón filtros – solo mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-grow flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high rounded-md text-sm font-medium border border-outline/10"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Filtros
            {hayFiltrosActivos && (
              <span className="w-2 h-2 rounded-full bg-primary-container inline-block" />
            )}
          </button>
          {/* Ordenar – mobile */}
          <div className="relative">
            <select
              value={ordenar}
              onChange={(e) => {
                setOrdenar(e.target.value as SortOption);
                setPagina(1);
              }}
              className="bg-surface-container-high border border-outline/10 text-sm font-medium py-2.5 pl-3 pr-8 rounded-md appearance-none cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">↑ Precio</option>
              <option value="price-desc">↓ Precio</option>
              <option value="name-asc">A–Z</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-on-surface/50">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex gap-10">
          {/* ── Sidebar Filtros ──────────────────────────────────────── */}
          <aside
            className={`
              ${sidebarOpen ? "flex" : "hidden"} lg:flex
              flex-col w-full lg:w-64 shrink-0 space-y-8
              fixed lg:static inset-0 lg:inset-auto z-50 lg:z-auto
              bg-background lg:bg-transparent p-6 lg:p-0 overflow-y-auto
            `}
          >
            {/* Header sidebar mobile */}
            <div className="flex items-center justify-between lg:hidden">
              <span className="font-headline font-bold text-lg tracking-tight">Filtros</span>
              <button onClick={() => setSidebarOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Limpiar filtros */}
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <span className="material-symbols-outlined text-sm">filter_list_off</span>
                Limpiar todos los filtros
              </button>
            )}

            {/* Categorías */}
            {categorias.length > 0 && (
              <div>
                <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-5">
                  Categoría
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <button
                      onClick={() => { setCategoriaSeleccionada(""); setPagina(1); }}
                      className={`text-sm font-body transition-colors w-full text-left ${
                        !categoriaSeleccionada
                          ? "text-on-surface font-semibold"
                          : "text-on-surface/50 hover:text-on-surface/80"
                      }`}
                    >
                      Todas las categorías
                    </button>
                  </li>
                  {categorias.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setCategoriaSeleccionada(cat.id);
                          setPagina(1);
                        }}
                        className={`text-sm font-body transition-colors w-full text-left flex items-center gap-2 ${
                          categoriaSeleccionada === cat.id
                            ? "text-on-surface font-semibold"
                            : "text-on-surface/50 hover:text-on-surface/80"
                        }`}
                      >
                        {categoriaSeleccionada === cat.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                        )}
                        {cat.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Material */}
            {materiales.length > 0 && (
              <div>
                <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-5">
                  Material
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setMaterialSeleccionado(""); setPagina(1); }}
                    className={`px-3 py-1 text-[10px] font-label uppercase tracking-wider rounded-sm border transition-all ${
                      !materialSeleccionado
                        ? "bg-surface-bright text-on-surface/90 border-on-surface/10"
                        : "bg-surface-container-highest text-on-surface/50 border-transparent hover:border-on-surface/10"
                    }`}
                  >
                    Todos
                  </button>
                  {materiales.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        setMaterialSeleccionado(
                          materialSeleccionado === mat.nombre ? "" : mat.nombre
                        );
                        setPagina(1);
                      }}
                      className={`px-3 py-1 text-[10px] font-label uppercase tracking-wider rounded-sm border transition-all ${
                        materialSeleccionado === mat.nombre
                          ? "bg-primary-container/20 text-primary-container border-primary-container/40"
                          : "bg-surface-container-highest text-on-surface/50 border-transparent hover:border-on-surface/10"
                      }`}
                    >
                      {mat.abreviatura || mat.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rango de Precio */}
            <div>
              <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-5">
                Rango de Precio
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0}
                  max={precioMaxDato}
                  step={5}
                  value={precioMax}
                  onChange={(e) => {
                    setPrecioMax(Number(e.target.value));
                    setPagina(1);
                  }}
                  className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
                />
                <div className="flex justify-between text-xs font-mono text-on-surface/40">
                  <span>S/. 0</span>
                  <span className="text-on-surface/70 font-semibold">
                    S/. {precioMax}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-5">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const activo = tagsSeleccionados.includes(tag.nombre);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.nombre)}
                        className={`px-2.5 py-1 text-[10px] font-label uppercase tracking-wider rounded-sm border transition-all ${
                          activo
                            ? "bg-primary-container/20 text-primary-container border-primary-container/40"
                            : "bg-surface-container-highest text-on-surface/50 border-transparent hover:border-on-surface/10"
                        }`}
                      >
                        #{tag.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solo disponibles */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => { setSoloDisponibles(!soloDisponibles); setPagina(1); }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    soloDisponibles ? "bg-primary-container" : "bg-surface-container-highest"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      soloDisponibles ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm font-body text-on-surface/70 group-hover:text-on-surface transition-colors">
                  Solo disponibles
                </span>
              </label>
            </div>

            {/* Botón aplicar – mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-full py-3 bg-primary-container text-white text-xs font-bold uppercase tracking-widest rounded-md"
            >
              Ver {productosFiltrados.length} productos
            </button>
          </aside>

          {/* Overlay sidebar – mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Grid de Productos ────────────────────────────────────── */}
          <section className="flex-grow min-w-0">
            {/* Resultados info */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-on-surface/40 font-label">
                {loading
                  ? "Cargando..."
                  : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""}`}
              </span>
              {hayFiltrosActivos && !loading && (
                <button
                  onClick={limpiarFiltros}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="flex flex-col animate-pulse">
                    <div className="aspect-[4/5] bg-surface-container-low mb-5 rounded-sm" />
                    <div className="h-5 bg-surface-container-low rounded w-3/4 mb-2" />
                    <div className="h-4 bg-surface-container-low rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              /* Sin resultados */
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-on-surface/20">
                  search_off
                </span>
                <p className="text-on-surface/50 font-body">
                  No se encontraron productos con estos filtros.
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-14 gap-x-6">
                  {productosPagina.map((product) => {
                    const imagenPrincipal =
                      product.images.find((i) => i.es_principal) ||
                      product.images[0];

                    return (
                      <Link
                        key={product.id}
                        href={`/catalogo/${product.id}`}
                        className="group relative flex flex-col"
                      >
                        {/* Imagen */}
                        <div className="aspect-[4/5] bg-surface-container-low overflow-hidden relative mb-5">
                          {imagenPrincipal?.url ? (
                            <Image
                              src={imagenPrincipal.url}
                              alt={imagenPrincipal.alt_text || product.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              unoptimized={
                                !imagenPrincipal.url.includes("res.cloudinary.com") &&
                                !imagenPrincipal.url.includes("images.unsplash.com") &&
                                !imagenPrincipal.url.includes("lh3.googleusercontent.com")
                              }
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-on-surface/20">
                                image
                              </span>
                            </div>
                          )}

                          {/* Badge categoría */}
                          {product.categoryName && (
                            <div className="absolute top-4 left-4">
                              <span className="text-[10px] font-bold px-2 py-1 tracking-tighter bg-black/70 text-white backdrop-blur-sm">
                                {product.categoryName.toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Badge disponibilidad */}
                          {!product.availability && (
                            <div className="absolute top-4 right-4">
                              <span className="text-[10px] font-bold px-2 py-1 tracking-tighter bg-surface-container-highest text-on-surface/60">
                                BAJO PEDIDO
                              </span>
                            </div>
                          )}

                          {/* Imágenes adicionales indicador */}
                          {product.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 flex gap-1">
                              {product.images.slice(0, 4).map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    idx === 0 ? "bg-white" : "bg-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-headline font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </div>

                          {/* Precio */}
                          {(() => {
                            const { discountedPrice, hasDiscount } = getDiscountedPrice(product, activeOffer);
                            return hasDiscount ? (
                              <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl font-headline font-bold text-primary">
                                    S/. {discountedPrice.toFixed(2)}
                                  </span>
                                  <span className="text-sm font-headline text-on-surface/40 line-through">
                                    S/. {product.price.toFixed(2)}
                                  </span>
                                </div>
                                <div className="inline-block bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                  {activeOffer?.title}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xl font-headline text-on-surface/60">
                                S/. {product.price.toFixed(2)}
                              </span>
                            );
                          })()}

                          {/* Tags + material + acción */}
                          <div className="pt-4 flex items-center justify-between border-t border-on-surface/5">
                            <div className="flex flex-wrap gap-2">
                              {product.material && (
                                <span className="text-[10px] font-label text-on-surface/30 uppercase">
                                  {product.material}
                                </span>
                              )}
                              {product.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-label text-on-surface/30 uppercase"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group/btn shrink-0">
                              Ver Detalles
                              <span className="material-symbols-outlined text-sm ml-1 transform group-hover/btn:translate-x-1 transition-transform">
                                arrow_forward
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ── Paginación ───────────────────────────────────────── */}
                {totalPaginas > 1 && (
                  <div className="mt-20 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={paginaSegura === 1}
                      className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPagina(n)}
                        className={`w-10 h-10 flex items-center justify-center font-bold text-xs transition-all ${
                          n === paginaSegura
                            ? "bg-primary text-on-primary"
                            : "border border-on-surface/10 hover:border-primary text-on-surface/60"
                        }`}
                      >
                        {String(n).padStart(2, "0")}
                      </button>
                    ))}

                    <button
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaSegura === totalPaginas}
                      className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen text-on-surface flex items-center justify-center">Cargando catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}
