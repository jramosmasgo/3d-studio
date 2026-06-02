import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Términos de Servicio", href: "/terminos" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Envíos", href: "/envios" },
  { label: "Soporte", href: "/soporte" },
];

const socialLinks = [
  { icon: "facebook", href: "https://www.facebook.com/profile.php?id=61566271775580", label: "Facebook" },
  { icon: "photo_camera", href: "https://www.instagram.com/studio3d.hyo", label: "Instagram" },
  { icon: "videocam", href: "https://www.tiktok.com/@studio3d.hyo", label: "TikTok" },
];

export default function Footer() {
  return (
    <footer className="w-full py-20 px-12 flex flex-col md:flex-row justify-between items-center max-w-screen-2xl mx-auto border-t border-[#e5e2e1]/5 bg-[#0a0a0a]">
      {/* Brand */}
      <div className="mb-12 md:mb-0 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <Image
            src="/logo/logo-blanco.png"
            alt="3D Studio Logo"
            width={32}
            height={32}
            className="opacity-80"
          />
          <span
            className="font-black text-2xl text-[#e5e2e1]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Studio 3D
          </span>
        </div>
        <p
          className="text-sm tracking-wide text-[#e5e2e1]/50"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          © {new Date().getFullYear()} Studio 3D. Excelencia técnica en cada
          capa.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap justify-center gap-10 md:gap-16">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[#e5e2e1]/40 hover:text-[#E30617] transition-colors duration-300 text-sm font-medium"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Social icons */}
      <div className="flex gap-6 mt-12 md:mt-0">
        {socialLinks.map((social) => (
          <Link
            key={social.icon}
            href={social.href}
            aria-label={social.label}
            className="w-10 h-10 rounded-full border border-[#e5e2e1]/10 flex items-center justify-center hover:border-[#ffb4ab] transition-colors text-[#e5e2e1]/40 hover:text-[#ffb4ab]"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              {social.icon}
            </span>
          </Link>
        ))}
      </div>
    </footer>
  );
}
