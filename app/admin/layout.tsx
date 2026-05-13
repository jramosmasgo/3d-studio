"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "dashboard" },
    { label: "Catálogo", href: "/admin/catalogo", icon: "category" },
    { label: "Pedidos", href: "/admin/pedidos", icon: "shopping_cart" },
    { label: "Configuración", href: "/admin/config", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex text-[#e5e2e1]">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/10 flex flex-col shrink-0">
        <div className="p-8 border-b border-outline-variant/5">
          <div className="flex items-center gap-3">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6xuVVhyoWsTbyLHKGKdEAO4vDn9wiwOdq1bZ_ZDFLTU2BLmv9kiIM6EjrBTRDTXhU3c4ZXKc7PhkPIhOx0n0TXj9TmDzsHBMef56o1MtrN8ZP19YNXU7VWODNqqVcjuXggwb9ZhEnZA8mviB9FJM9iuompM_xZUPjokS-WQ5Dq0qZqhYub6Y310uoYsN2OnLFOAg8j9Fhuw1yqzB1gCMZlgj4k4VkjBKsPhWt91slURPmTYihhUnq8wSnuwOH8B0CVyUEbJsoiMn7"
              alt="Studio 3D Logo"
              width={32}
              height={32}
              unoptimized
            />
            <span className="font-headline font-bold text-xl tracking-tighter uppercase">
              Admin <span className="text-primary-container">Studio</span>
            </span>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary-container text-white shadow-lg shadow-primary-container/20"
                    : "text-on-surface/50 hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-outline-variant/5">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 text-on-surface/40 hover:text-primary transition-colors text-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-outline-variant/5 bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface/40 font-label">
            {menuItems.find(item => item.href === pathname)?.label || "Administración"}
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface/40">notifications</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-highest/50 px-4 py-1.5 rounded-full border border-outline-variant/10">
              <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold">AD</div>
              <span className="text-xs font-bold uppercase tracking-tighter">Administrador</span>
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
