"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"idle" | "auth" | "checking">("idle");
  const { signIn, error, user, loading } = useAuth();
  const router = useRouter();

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStep("auth");
    try {
      // Pequeña pausa visual para mostrar el paso de autenticación
      await new Promise((r) => setTimeout(r, 400));
      setStep("checking");
      await signIn(email, password);
      router.replace("/admin");
    } catch {
      // El error ya queda en AuthContext
      setStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar nada mientras redirige
  if (!loading && user) return null;

  return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-surface-container-highest rounded-2xl flex items-center justify-center mb-6 border border-outline-variant/20 shadow-xl shadow-black/40">
            <Image
              src="/logo/logo-blanco.png"
              alt="Studio 3D Logo"
              width={40}
              height={40}
            />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase text-center">
            Panel de <span className="text-primary-container">Control</span>
          </h1>
          <p className="text-on-surface/40 text-sm mt-2 font-body tracking-widest uppercase">
            Administración Studio 3D
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-surface-container-low p-8 md:p-10 rounded-2xl border border-outline-variant/10 shadow-2xl shadow-black/50 backdrop-blur-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                Identificador de Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/20 text-xl">
                  alternate_email
                </span>
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@studio3d.com"
                  className="w-full bg-surface-container-highest border-none pl-12 pr-4 py-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all font-body"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                Clave de Acceso
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/20 text-xl">
                  lock
                </span>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-highest border-none pl-12 pr-4 py-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all font-body"
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Indicador de pasos mientras carga */}
            {isSubmitting && (
              <div className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-xl px-4 py-3 space-y-2">
                <div className={`flex items-center gap-2 text-xs font-bold transition-colors
                  ${step === "auth" ? "text-primary-container" : step === "checking" ? "text-green-400" : "text-on-surface/20"}`}>
                  <span className={`material-symbols-outlined text-sm ${step === "auth" ? "animate-spin" : ""}`}>
                    {step === "checking" ? "check_circle" : "lock"}
                  </span>
                  Verificando credenciales
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold transition-colors
                  ${step === "checking" ? "text-primary-container" : "text-on-surface/20"}`}>
                  <span className={`material-symbols-outlined text-sm ${step === "checking" ? "animate-spin" : ""}`}>
                    admin_panel_settings
                  </span>
                  Validando permisos de administrador
                </div>
              </div>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-primary-container text-white font-bold tracking-widest uppercase rounded-xl hover:brightness-110 transition-all active:scale-[0.98] font-label shadow-xl shadow-primary-container/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">
                    progress_activity
                  </span>
                  {step === "checking" ? "Verificando permisos…" : "Autenticando…"}
                </>
              ) : (
                <>
                  Autenticar
                  <span className="material-symbols-outlined text-lg">login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-on-surface/20 text-[10px] tracking-widest uppercase font-label">
          Sistema de gestión Studio 3D © 2025
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="text-xs text-on-surface/40 hover:text-primary-container transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al Sitio Público
          </Link>
        </div>
      </div>
    </main>
  );
}
