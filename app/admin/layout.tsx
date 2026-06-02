"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const isLoginPage = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Guard: redirigir a login si no hay sesión (excepto en la página de login)
  useEffect(() => {
    if (!isLoginPage && !loading && !user) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, loading, user, router]);

  // Cerrar el menú móvil en cambio de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Mientras verifica la sesión, mostrar loader
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
            progress_activity
          </span>
          <p className="text-on-surface/40 text-sm font-label tracking-widest uppercase">
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  // Iniciales del usuario para el avatar
  const initials = user.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user.email ?? "AD").slice(0, 2).toUpperCase();

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "dashboard" },
    { label: "Contenido", href: "/admin/contenido", icon: "edit_document" },
    { label: "Catálogo", href: "/admin/catalogo", icon: "category" },
    { label: "Ofertas", href: "/admin/ofertas", icon: "local_offer" },
    { label: "Administradores", href: "/admin/admins", icon: "admin_panel_settings" },
    { label: "Configuración", href: "/admin/config", icon: "settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col md:flex-row text-[#e5e2e1] overflow-hidden">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden h-16 bg-surface-container-low border-b border-outline-variant/10 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo-blanco.png"
            alt="Studio 3D Logo"
            width={24}
            height={24}
          />
          <span className="font-headline font-bold text-base tracking-tighter uppercase">
            Admin <span className="text-primary-container">Studio</span>
          </span>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-on-surface/80">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-72 bg-surface-container-low border-r border-outline-variant/10 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:h-screen`}
      >
        <div className="p-8 border-b border-outline-variant/5 hidden md:block">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo-blanco.png"
              alt="Studio 3D Logo"
              width={32}
              height={32}
            />
            <span className="font-headline font-bold text-xl tracking-tighter uppercase">
              Admin <span className="text-primary-container">Studio</span>
            </span>
          </div>
        </div>

        {/* Mobile-only menu header */}
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between md:hidden mt-16">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">Navegación</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-on-surface/40 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
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


      </aside>

      {/* Backdrop for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 md:h-screen overflow-hidden">
        {/* Top Header - Desktop Only */}
        <header className="hidden md:flex h-20 border-b border-outline-variant/5 bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-20 items-center justify-between px-8 lg:px-10 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface/40 font-label">
            {menuItems.find((item) => item.href === pathname)?.label || "Administración"}
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center cursor-pointer hover:bg-surface-container-highest/80 transition-colors">
              <span className="material-symbols-outlined text-on-surface/40">notifications</span>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 bg-surface-container-highest/50 hover:bg-surface-container-highest px-4 py-1.5 rounded-full border border-outline-variant/10 transition-colors"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-xs font-bold uppercase tracking-tighter max-w-[120px] truncate text-left">
                  {user.displayName ?? user.email ?? "Administrador"}
                </span>
                <span className="material-symbols-outlined text-sm text-on-surface/40">
                  {isUserMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                  <Link
                    href="/admin/perfil"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface/80 hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">manage_accounts</span>
                    <span>Perfil</span>
                  </Link>
                  <div className="border-t border-outline-variant/5 my-1" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface/40 hover:bg-surface-container-highest hover:text-red-400 transition-colors w-full text-left"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-grow overflow-y-auto w-full p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
