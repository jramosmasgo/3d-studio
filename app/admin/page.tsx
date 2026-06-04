"use client";

import { useEffect, useState } from "react";
import { getProducts, type Product } from "@/lib/firebase/products-service";
import { getOfertas, type Oferta } from "@/lib/firebase/ofertas-service";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeOffer, setActiveOffer] = useState<Oferta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);

        const fetchedOffers = await getOfertas();
        const active = fetchedOffers.find((o) => o.isActive) || null;
        setActiveOffer(active);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalProducts = products.length;
  const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
  const availableProducts = products.filter((p) => p.availability).length;
  const unavailableProducts = products.filter((p) => !p.availability).length;

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold font-headline tracking-tighter uppercase">Cargando Dashboard…</h1>
          <p className="text-on-surface/40 font-body">Obteniendo información en tiempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl animate-pulse space-y-4">
              <div className="w-10 h-10 bg-surface-container-highest rounded-lg" />
              <div className="h-4 w-24 bg-surface-container-highest rounded" />
              <div className="h-8 w-16 bg-surface-container-highest rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tighter uppercase">Dashboard</h1>
        <p className="text-on-surface/40 font-body">Resumen general del estado de Studio 3D.</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Productos Registrados */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col justify-between hover:border-primary-container/30 transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-surface-container-highest text-blue-400">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface/20 uppercase tracking-widest">Estadística</span>
            </div>
            <h3 className="text-on-surface/40 text-xs font-bold uppercase tracking-widest mb-1">Productos Registrados</h3>
          </div>
          <p className="text-4xl font-bold font-headline tracking-tight mt-2">{totalProducts}</p>
        </div>

        {/* Conteo de Vistas */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col justify-between hover:border-primary-container/30 transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-surface-container-highest text-cyan-400">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface/20 uppercase tracking-widest">Estadística</span>
            </div>
            <h3 className="text-on-surface/40 text-xs font-bold uppercase tracking-widest mb-1">Vistas Totales</h3>
          </div>
          <p className="text-4xl font-bold font-headline tracking-tight mt-2">{totalViews.toLocaleString()}</p>
        </div>

        {/* Productos Disponibles */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col justify-between hover:border-primary-container/30 transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-surface-container-highest text-green-400">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface/20 uppercase tracking-widest">Estadística</span>
            </div>
            <h3 className="text-on-surface/40 text-xs font-bold uppercase tracking-widest mb-1">Productos Disponibles</h3>
          </div>
          <p className="text-4xl font-bold font-headline tracking-tight mt-2 text-green-400">{availableProducts}</p>
        </div>

        {/* Productos No Disponibles */}
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col justify-between hover:border-primary-container/30 transition-all duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-surface-container-highest text-red-400">
                <span className="material-symbols-outlined">cancel</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface/20 uppercase tracking-widest">Estadística</span>
            </div>
            <h3 className="text-on-surface/40 text-xs font-bold uppercase tracking-widest mb-1">Productos No Disponibles</h3>
          </div>
          <p className="text-4xl font-bold font-headline tracking-tight mt-2 text-red-400">{unavailableProducts}</p>
        </div>

      </div>

      {/* Tarjeta de Oferta Activa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] hover:border-primary-container/30 transition-all duration-300">
          <span className="material-symbols-outlined text-9xl text-on-surface/5 absolute -bottom-6 -right-6">local_offer</span>
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-container font-label flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">local_offer</span>
              Oferta Activa en Plataforma
            </h3>
            
            {activeOffer ? (
              <div className="space-y-2">
                <h4 className="text-2xl font-bold font-headline uppercase tracking-tight text-on-surface">
                  {activeOffer.title}
                </h4>
                <p className="text-on-surface/60 text-sm max-w-xl font-body">
                  {activeOffer.description}
                </p>
                <div className="flex gap-4 items-center pt-2">
                  <span className="text-xs font-bold px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container rounded-full uppercase tracking-wider">
                    Descuento: {activeOffer.discountValue}{activeOffer.discountType === "percentage" ? "%" : " S/."}
                  </span>
                  <span className="text-xs font-mono text-on-surface/40">
                    Vence: {activeOffer.endDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-on-surface/40 text-sm font-body">
                  Actualmente no hay ninguna oferta activa configurada en la plataforma.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
