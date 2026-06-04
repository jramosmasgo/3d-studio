"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TopNavBar from "../../components/TopNavBar";
import Footer from "../../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { getProduct, type Product, incrementProductViews } from "@/lib/firebase/products-service";
import { getOfertas, type Oferta } from "@/lib/firebase/ofertas-service";

function getDiscountedPrice(product: Product, offer: Oferta | null): { discountedPrice: number; hasDiscount: boolean } {
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
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [activeOffer, setActiveOffer] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleBuyOnWhatsapp = () => {
    if (!product) return;
    const currentUrl = window.location.href;
    const text = `Hola, deseo consultar sobre el producto "${product.name}". Estaba viendo este enlace: ${currentUrl}`;
    const whatsappUrl = `https://wa.me/51978911898?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        // Incrementar vistas
        await incrementProductViews(id).catch(err =>
          console.error("Error incrementing product views:", err)
        );

        const [prod, offers] = await Promise.all([
          getProduct(id),
          getOfertas(),
        ]);

        if (prod) {
          setProduct(prod);
        }

        const active = offers.find((o) => o.isActive) || null;
        setActiveOffer(active);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    // Helper para actualizar o crear meta tags
    const updateOrCreateMetaTag = (keyName: string, keyValue: string, contentValue: string) => {
      let el = document.querySelector(`meta[${keyName}="${keyValue}"]`);
      let isNew = false;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(keyName, keyValue);
        document.head.appendChild(el);
        isNew = true;
      }
      el.setAttribute("content", contentValue);
      return { el, isNew };
    };

    // Guardar el título original
    const originalTitle = document.title;
    document.title = `${product.name} | Studio 3D`;

    // Actualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute("content") || "";

    if (metaDescription) {
      metaDescription.setAttribute("content", product.description || "");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = product.description || "";
      document.head.appendChild(meta);
    }

    // Actualizar metadatos Open Graph
    const ogTitle = updateOrCreateMetaTag("property", "og:title", `${product.name} | Studio 3D`);
    const ogDescription = updateOrCreateMetaTag("property", "og:description", product.description || "");
    
    const firstImageUrl = product.images?.[0]?.url || "";
    const ogImage = updateOrCreateMetaTag("property", "og:image", firstImageUrl);

    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.setAttribute("content", originalDescription);
      }
      // Limpiar etiquetas og creadas dinámicamente al desmontar
      if (ogTitle.isNew) ogTitle.el.remove();
      if (ogDescription.isNew) ogDescription.el.remove();
      if (ogImage.isNew) ogImage.el.remove();
    };
  }, [product]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface/60 font-body text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-headline font-bold">Producto no encontrado</h1>
        <Link href="/catalogo" className="px-6 py-3 bg-primary-container text-white text-xs font-bold uppercase tracking-widest rounded-md">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  // Prepara las imágenes para el carrusel
  const productImages = product.images && product.images.length > 0
    ? product.images.map(img => ({ src: img.url, alt: img.alt_text || product.name }))
    : [{ src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrB5nBeijCzZc4xE3zLNPKIJEyV8T8F--zUs46HMq7sSm7PP23ydFUoIWY3vHF4fw9FJGupOTf8_evww9w-gyJta5gKphvNH0Yw5h4X5eNN-Wp-ao1xiu71HR75whYQ1q0NyKvug078XUyqHh-HXjDcJa9VRT7X4v_iyP6-umz_CMM9GIThR0gJaVDmB72LF8XifNUNEyYuB7qRfwkqmpUYO2HFzYewHQPaDfxGIFbnMUjERLYmRlXkoNVsQrMTUlwCgDHmxTW93Uw", alt: product.name }];

  return (
    <>
      <TopNavBar />
      <main className="max-w-[1440px] mx-auto px-8 md:px-16 py-12 lg:py-24 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pt-16">
          {/* Gallery Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative group overflow-hidden bg-surface-container-low aspect-[4/5] md:aspect-square flex items-center justify-center rounded-lg border border-outline-variant/10 shadow-md">
              <Image
                src={productImages[activeIndex]?.src || productImages[0].src}
                alt={productImages[activeIndex]?.alt || productImages[0].alt}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                unoptimized
                priority
              />

              {/* Navigation overlays */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:scale-105"
                    aria-label="Imagen anterior"
                  >
                    <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg hover:scale-105"
                    aria-label="Siguiente imagen"
                  >
                    <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none justify-start">
              {productImages.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative aspect-square w-24 md:w-28 rounded-md overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${activeIndex === idx
                    ? "border-primary scale-[1.02] shadow-md shadow-primary/20 brightness-110"
                    : "border-outline-variant/30 opacity-70 hover:opacity-100 hover:border-outline-variant"
                    }`}
                >
                  <Image
                    src={image.src}
                    alt={`Miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5 flex flex-col gap-10 lg:sticky lg:top-32">
            <div>
              <span className="text-primary font-headline tracking-widest text-[0.65rem] uppercase mb-2 block font-bold">
                Categoría: {product.categoryName || "Estatuas 3D"}
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-surface leading-[0.9] mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4 mt-6 flex-wrap">
                {(() => {
                  const { discountedPrice, hasDiscount } = getDiscountedPrice(product, activeOffer);
                  return hasDiscount ? (
                    <>
                      <span className="text-3xl font-headline font-bold text-primary">
                        S/. {discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-on-surface-variant line-through uppercase tracking-wider opacity-50">
                        S/. {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary uppercase font-bold rounded-sm tracking-wider">
                        {activeOffer?.title}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-headline font-medium text-on-surface">
                      S/. {product.price.toFixed(2)}
                    </span>
                  );
                })()}
              </div>
            </div>

            <p className="text-on-secondary-container leading-relaxed max-w-md font-body">
              {product.description}
            </p>

            {/* Technical Specs Table */}
            <div className="bg-surface-container-low p-8 flex flex-col gap-6 rounded-sm border border-outline-variant/5">
              <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Material
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {product.material || "Resina de Alta Definición"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Disponibilidad
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {product.availability ? "Disponible (En Stock)" : "Bajo Pedido"}
                  </span>
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Etiquetas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags && product.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface-bright text-[0.6rem] font-bold uppercase tracking-wider text-on-surface rounded-sm border border-outline-variant/10">
                        #{tag}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 bg-surface-bright text-[0.6rem] font-bold uppercase tracking-wider text-on-surface rounded-sm border border-outline-variant/10">
                      {product.availability ? "Listo para Enviar" : "A Pedido Personalizado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleBuyOnWhatsapp}
                className="w-full py-5 bg-primary-container text-white font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all rounded-sm shadow-lg shadow-primary-container/20 flex items-center justify-center cursor-pointer"
              >
                <svg
                  className="w-5 h-5 mr-3 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                COMPRAR
              </button>
            </div>

            {/* Delivery Methods */}
            <div className="flex flex-col gap-4 mt-2">
              <h4 className="font-headline text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                Métodos de entrega
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Method 1: Despacho Programado */}
                <div className="bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 p-4 rounded-md border border-outline-variant/10 flex flex-col items-center text-center gap-2 relative group hover:-translate-y-0.5">
                  <div className="absolute top-0 left-0 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-md rounded-tl-md">
                    ✓
                  </div>
                  <svg className="w-8 h-8 text-primary mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125a1.125 1.125 0 0 0 1.125-1.125V9.75M3.75 12h14.25M3.75 15h14.25m-15-7.5h10.875c.621 0 1.125.504 1.125 1.125v6.75H1.875V8.625A1.125 1.125 0 0 1 3.75 7.5ZM13.5 7.5h5.625c.621 0 1.125.504 1.125 1.125v4.5H13.5V7.5Z" />
                  </svg>
                  <span className="text-[0.75rem] font-bold text-primary font-headline">
                    Despacho Programado
                  </span>
                  <span className="text-[0.65rem] text-on-surface/60 font-body leading-tight">
                    Envíos a todo el Perú. Precios disponibles por chat al Whatsapp.
                  </span>
                </div>

                {/* Method 2: Retiro en Tienda */}
                <div className="bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 p-4 rounded-md border border-outline-variant/10 flex flex-col items-center text-center gap-2 relative group hover:-translate-y-0.5">
                  <div className="absolute top-0 left-0 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-md rounded-tl-md">
                    ✓
                  </div>
                  <svg className="w-8 h-8 text-primary mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <span className="text-[0.75rem] font-bold text-primary font-headline">
                    Retiro en Tienda
                  </span>
                  <span className="text-[0.65rem] text-on-surface/60 font-body leading-tight">
                    Disponible para recojo en tienda en 24 horas desde la compra.
                  </span>
                </div>

                {/* Method 3: Compra en Tienda */}
                <div className="bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 p-4 rounded-md border border-outline-variant/10 flex flex-col items-center text-center gap-2 relative group hover:-translate-y-0.5">
                  <div className="absolute top-0 left-0 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-md rounded-tl-md">
                    ✓
                  </div>
                  <svg className="w-8 h-8 text-primary mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h.008v.008H6.75V18Zm0-3h.008v.008H6.75V15Zm0-3h.008v.008H6.75V12Zm9 6h.008v.008H15.75V18Zm0-3h.008v.008H15.75V15Zm0-3h.008v.008H15.75V12Z" />
                  </svg>
                  <span className="text-[0.75rem] font-bold text-primary font-headline">
                    Compra en Tienda
                  </span>
                  <span className="text-[0.65rem] text-on-surface/60 font-body leading-tight">
                    Puedes comprar en Alejandro O. Deustua #689 - Huancayo.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-32 pt-16 border-t border-outline-variant/10">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight">
              Piezas Relacionadas
            </h2>
            <Link
              href="/catalogo"
              className="text-primary text-sm font-bold uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all"
            >
              Ver Catálogo Completo
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Related 1 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMX8Q8k7qBazs_nIk3WU28lQHu3tjW1CO1o5yzE5_uIl8dWtJO7Bl5uBBVg1hxuJZ9cQzf4v2tDMEg2HcL6bGuKYrPGaRAIsq3wxIMiz8SCeazOAJ9jx-XltpauBlPM53IniN_qDxllklvyqowBhdcoaFQ9K3ZBsc0FdShosdjo1e9HsbDQHu2hskux2IBroJWffMmqZ-3ki-HO30aXyqy_HpWjWov7lWT73gBjpJIGG_nciZRlbrlNH1QZGXiLmGZ4rekSrB6bRyc"
                  alt="Relic Hunter"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Relic Hunter VII
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 89.00</p>
            </div>
            {/* Related 2 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuHn3ppCGEt2qo2cMIK1_CDIQQhy502dmjxJmkBALSOw6SzNL_s36-3JTi-CNFmhtPdCEkxccF0GEdOPUyz8QPFb6cQu0r-a1S77ueAJUayX_fY5VdNIXEhg2ARMv-kh2yfHvjxyPNg_BBpL24wTujMpJ5Z_GTaSddzwmP06gFbvknFH2qbk-zkY3AtmpGZm26wqmpaR6BIahDXvdTkoz1Vj7Oe297RhDzmxqeXfQ8OtxIu2zumSIkTG4ghyvKx90j2R2_gOselXRC"
                  alt="Exo-Frame"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Exo-Frame Modular
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 145.00</p>
            </div>
            {/* Related 3 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb9u6CCrc0rxSvWHDl8TiYaZ2ZBNT4TU2Zh6HsyXI9zy6xagEmL2fDJsBZ0gnb3ePiBW5-3KAk1TfbI18yWw6kEWedoN7YfyPgewNRo2uMlnqkRgalWRNXMVK6ZkIg5PTd2kw4arpEd_wSSFf-UZil5DaqAah-m3plBY11-LbHKWS2rzr37-uenuy0_z3DYRVG-ou7tXavPk1TExZy9YRvV7jDbR1ak2K1VAV6RowvhRnSniEmxhRxMoQmHtoSHfEpAjIko4Q45qu6"
                  alt="Neural Core"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Neural Core Apex
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 210.00</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
