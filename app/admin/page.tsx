"use client";

export default function AdminDashboard() {
  const stats = [
    { label: "Ventas Totales", value: "S/. 4,520", icon: "payments", color: "text-green-400" },
    { label: "Pedidos Pendientes", value: "12", icon: "pending_actions", color: "text-amber-400" },
    { label: "Productos en Stock", value: "84", icon: "inventory_2", color: "text-blue-400" },
    { label: "Visitas Hoy", value: "1,240", icon: "trending_up", color: "text-primary" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tighter uppercase">Bienvenido, Admin</h1>
        <p className="text-on-surface/40 font-body">Resumen general del estado de Studio 3D.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-surface-container-highest ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface/20 uppercase tracking-widest">Estadística</span>
            </div>
            <h3 className="text-on-surface/40 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold font-headline tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity / Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
          <h3 className="text-xl font-bold mb-6 font-headline uppercase tracking-tight">Actividad Reciente</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-6 border-b border-outline-variant/5 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Pedido #240{i} enviado</p>
                  <p className="text-xs text-on-surface/40">Hace {i} horas • Visor Táctico Aegis</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary-container p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <span className="material-symbols-outlined text-9xl text-white/10 absolute -bottom-4 -right-4">analytics</span>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 font-headline uppercase tracking-tight">Rendimiento Mensual</h3>
            <p className="text-white/70 text-sm max-w-xs">Tus ventas han aumentado un 15% respecto al mes anterior. ¡Sigue así!</p>
          </div>
          <button className="bg-white text-primary-container px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest self-start shadow-xl shadow-black/20">
            Ver Reporte Detallado
          </button>
        </div>
      </div>
    </div>
  );
}
