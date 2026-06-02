"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getProducts, type Product } from "@/lib/firebase/products-service";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Servicios", href: "/servicios" },
  { label: "Nosotros", href: "/nosotros" },
];

// Highlight matching text inside a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(227,6,23,0.25)", color: "#ff4d5e", borderRadius: "2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // ── Mobile drawer ───────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Predictive Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load all active products once when the user first focuses the search
  const loadProducts = useCallback(async () => {
    if (allProducts !== null) return;
    setLoadingProducts(true);
    try {
      const prods = await getProducts();
      setAllProducts(prods.filter((p) => p.isActive));
    } catch {
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [allProducts]);

  // Filter locally as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !allProducts) {
      setSearchResults([]);
      setHighlightedIndex(-1);
      return;
    }
    const filtered = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
    setSearchResults(filtered);
    setHighlightedIndex(-1);
  }, [searchQuery, allProducts]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsFocused(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsFocused(false);
    setSearchQuery("");
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsFocused(false);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const product = searchResults[highlightedIndex];
      setIsFocused(false);
      setSearchQuery("");
      router.push(`/catalogo/${product.id}`);
    }
  };

  const showDropdown = isFocused && searchQuery.trim().length > 0;

  // ── Mobile drawer JSX ───────────────────────────────────────────────────
  const drawer = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0e0e0e",
        backgroundImage:
          "radial-gradient(circle at top right, rgba(227, 6, 23, 0.1), transparent), radial-gradient(circle at bottom left, rgba(227, 6, 23, 0.05), transparent)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
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
          <a href="https://www.facebook.com/profile.php?id=61566271775580" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
          <a href="https://www.instagram.com/studio3d.hyo" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
          </a>
          <a href="https://www.tiktok.com/@studio3d.hyo" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", opacity: 0.8 }}>
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.54-4.06-1.44-.45-.35-.85-.77-1.21-1.24-.02 2.11.01 4.21-.01 6.32 0 5.28-4.17 9.03-9.15 9.15-4.9-.12-8.91-4.41-8.91-9.31 0-4.81 3.91-8.72 8.72-8.72.63 0 1.26.07 1.87.21V9.2c-.61-.19-1.26-.26-1.9-.21-2.61.12-4.66 2.37-4.55 4.98.02 1.34.6 2.59 1.58 3.51.97.91 2.28 1.39 3.61 1.32 2.36-.07 4.26-2.01 4.23-4.38.01-4.83.01-9.66.01-14.49.02-.01.03-.01.05-.01z" /></svg>
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
            src="/logo/logo-blanco.png"
            alt="Studio 3D Logo"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
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

        {/* ── Search – desktop only ─────────────────────────────── */}
        <div ref={searchContainerRef} className="hidden lg:block" style={{ position: "relative", width: "30rem" }}>
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: isFocused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                padding: "0.6rem 1.25rem",
                borderRadius: isFocused && showDropdown ? "0.75rem 0.75rem 0 0" : "0.75rem",
                border: isFocused ? "1px solid rgba(227, 6, 23, 0.4)" : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#E30617", flexShrink: 0 }}>search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  loadProducts();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar figuras, personajes o categorías..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.85rem",
                  color: "rgba(229,226,225,0.9)",
                  flex: 1,
                  minWidth: 0,
                }}
                aria-label="Buscar productos"
                autoComplete="off"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(255,255,255,0.3)", display: "flex" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                </button>
              ) : (
                <div style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 700, flexShrink: 0 }}>
                  CTRL K
                </div>
              )}
            </div>
          </form>

          {/* ── Predictive Dropdown ── */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1a1a1a",
                border: "1px solid rgba(227, 6, 23, 0.3)",
                borderTop: "none",
                borderRadius: "0 0 0.75rem 0.75rem",
                overflow: "hidden",
                zIndex: 10001,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {loadingProducts ? (
                <div style={{ padding: "1rem 1.25rem", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}>progress_activity</span>
                  Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: "1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>Sin resultados para</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 600 }}>"{searchQuery}"</span>
                </div>
              ) : (
                <>
                  {searchResults.map((product, idx) => {
                    const img = product.images.find((i) => i.es_principal) || product.images[0];
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <Link
                        key={product.id}
                        href={`/catalogo/${product.id}`}
                        onClick={() => { setIsFocused(false); setSearchQuery(""); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.875rem",
                          padding: "0.75rem 1.25rem",
                          textDecoration: "none",
                          background: isHighlighted ? "rgba(227,6,23,0.08)" : "transparent",
                          borderLeft: isHighlighted ? "2px solid #E30617" : "2px solid transparent",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                      >
                        {/* Thumbnail */}
                        <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "#2a2a2a", flexShrink: 0, position: "relative" }}>
                          {img?.url ? (
                            <Image src={img.url} alt={product.name} fill sizes="40px" style={{ objectFit: "cover" }} unoptimized />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "rgba(255,255,255,0.2)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>image</span>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontFamily: "var(--font-space-grotesk)", fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <Highlight text={product.name} query={searchQuery} />
                          </p>
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>
                            {product.categoryName}
                          </p>
                        </div>

                        {/* Price */}
                        <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "0.85rem", fontWeight: 700, color: "#E30617", flexShrink: 0 }}>
                          S/. {product.price.toFixed(2)}
                        </span>
                      </Link>
                    );
                  })}

                  {/* Ver todos */}
                  <button
                    onClick={() => {
                      setIsFocused(false);
                      setSearchQuery("");
                      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      background: "rgba(227,6,23,0.06)",
                      border: "none",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      color: "#E30617",
                      fontFamily: "var(--font-space-grotesk)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(227,6,23,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(227,6,23,0.06)"; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>search</span>
                    Ver todos los resultados para "{searchQuery}"
                  </button>
                </>
              )}
            </div>
          )}
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
