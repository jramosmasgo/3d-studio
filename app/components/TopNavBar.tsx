"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/catalogo" },
  { label: "Nosotros", href: "/nosotros" },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Needed for createPortal – only runs on the client
  useEffect(() => { setMounted(true); }, []);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const drawer = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0e0e0e",
        backgroundImage: "radial-gradient(circle at top right, rgba(227, 6, 23, 0.1), transparent), radial-gradient(circle at bottom left, rgba(227, 6, 23, 0.05), transparent)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Close button inside the drawer */}
      <button
        onClick={() => setOpen(false)}
        style={{
          position: "absolute",
          top: "2rem",
          right: "1.5rem",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem", width: "100%" }}>
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(2.5rem, 10vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: pathname === link.href ? "#E30617" : "#ffffff",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "transform 0.3s ease",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Síguenos</p>
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Facebook */}
          <a href="https://www.facebook.com/profile.php?id=61566271775580" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          {/* Instagram */}
          <a href="https://www.instagram.com/studio3d.hyo" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          {/* TikTok */}
          <a href="https://www.tiktok.com/@studio3d.hyo" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.54-4.06-1.44-.45-.35-.85-.77-1.21-1.24-.02 2.11.01 4.21-.01 6.32 0 5.28-4.17 9.03-9.15 9.15-4.9-.12-8.91-4.41-8.91-9.31 0-4.81 3.91-8.72 8.72-8.72.63 0 1.26.07 1.87.21V9.2c-.61-.19-1.26-.26-1.9-.21-2.61.12-4.66 2.37-4.55 4.98.02 1.34.6 2.59 1.58 3.51.97.91 2.28 1.39 3.61 1.32 2.36-.07 4.26-2.01 4.23-4.38.01-4.83.01-9.66.01-14.49.02-.01.03-.01.05-.01z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Navbar ─────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          background: "rgba(19,19,19,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6xuVVhyoWsTbyLHKGKdEAO4vDn9wiwOdq1bZ_ZDFLTU2BLmv9kiIM6EjrBTRDTXhU3c4ZXKc7PhkPIhOx0n0TXj9TmDzsHBMef56o1MtrN8ZP19YNXU7VWODNqqVcjuXggwb9ZhEnZA8mviB9FJM9iuompM_xZUPjokS-WQ5Dq0qZqhYub6Y310uoYsN2OnLFOAg8j9Fhuw1yqzB1gCMZlgj4k4VkjBKsPhWt91slURPmTYihhUnq8wSnuwOH8B0CVyUEbJsoiMn7"
            alt="Studio 3D Logo"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
            unoptimized
          />
          <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.04em", color: "#E30617" }}>
            Studio 3D
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: "2rem", alignItems: "center" }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontWeight: 500,
                color: pathname === link.href ? "#E30617" : "rgba(229,226,225,0.7)",
                textDecoration: "none",
                borderBottom: pathname === link.href ? "2px solid #E30617" : "none",
                paddingBottom: pathname === link.href ? "4px" : "0",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search – desktop only */}
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.75rem", background: "#353535", padding: "0.5rem 1rem", borderRadius: "0.375rem", width: "20rem", cursor: "text" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", opacity: 0.5 }}>search</span>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", color: "rgba(229,226,225,0.4)" }}>Buscar figuras...</span>
        </div>

        {/* Hamburger – mobile only */}
        <button
          onClick={() => setOpen(!open)}
          className="flex md:hidden items-center justify-center"
          aria-label="Toggle navigation"
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "50%",
            backgroundColor: "#E30617",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            {open ? "close" : "menu"}
          </span>
        </button>
      </nav>

      {/* ── Mobile drawer – rendered via Portal to escape stacking context ── */}
      {mounted && open && createPortal(drawer, document.body)}
    </>
  );
}
