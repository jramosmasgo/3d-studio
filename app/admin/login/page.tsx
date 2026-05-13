"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6xuVVhyoWsTbyLHKGKdEAO4vDn9wiwOdq1bZ_ZDFLTU2BLmv9kiIM6EjrBTRDTXhU3c4ZXKc7PhkPIhOx0n0TXj9TmDzsHBMef56o1MtrN8ZP19YNXU7VWODNqqVcjuXggwb9ZhEnZA8mviB9FJM9iuompM_xZUPjokS-WQ5Dq0qZqhYub6Y310uoYsN2OnLFOAg8j9Fhuw1yqzB1gCMZlgj4k4VkjBKsPhWt91slURPmTYihhUnq8wSnuwOH8B0CVyUEbJsoiMn7"
              alt="Studio 3D Logo"
              width={40}
              height={40}
              unoptimized
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
          <form className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@studio3d.com"
                  className="w-full bg-surface-container-highest border-none pl-12 pr-4 py-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all font-body"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-highest border-none pl-12 pr-4 py-4 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all font-body"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface/40 hover:text-on-surface transition-colors">
                <input type="checkbox" className="rounded-sm bg-surface-container-highest border-none text-primary-container focus:ring-offset-background" />
                Recordar sesión
              </label>
              <Link href="#" className="text-primary-container hover:underline font-medium">
                ¿Olvidaste tu clave?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-primary-container text-white font-bold tracking-widest uppercase rounded-xl hover:brightness-110 transition-all active:scale-[0.98] font-label shadow-xl shadow-primary-container/20 flex items-center justify-center gap-2"
            >
              Autenticar
              <span className="material-symbols-outlined text-lg">login</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-on-surface/20 text-[10px] tracking-widest uppercase font-label">
          Sistema de gestión Studio 3D © 2024
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/" className="text-xs text-on-surface/40 hover:text-primary-container transition-colors flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al Sitio Público
          </Link>
        </div>
      </div>
    </main>
  );
}
