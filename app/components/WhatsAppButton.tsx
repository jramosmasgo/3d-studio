"use client";

import React from "react";

export default function WhatsAppButton() {
  const phoneNumber = "51925219464"; // Reemplaza con el número real si es diferente
  const message = "Hola Studio 3D! Quiero comunicarme con un asesor para consultar.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        backgroundColor: "#25D366",
        color: "#fff",
        width: "3.5rem",
        height: "3.5rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(37, 211, 102, 0.3)",
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1) translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 15px 30px rgba(37, 211, 102, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(37, 211, 102, 0.3)";
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.048c0 2.12.54 4.19 1.566 6.02L0 24l6.111-1.603a11.846 11.846 0 005.935 1.588h.005c6.637 0 12.05-5.414 12.056-12.05a11.817 11.817 0 00-3.41-8.423" />
      </svg>
      {/* Subtle pulse effect */}
      <span
        style={{
          position: "absolute",
          inset: "-4px",
          borderRadius: "50%",
          border: "2px solid #25D366",
          opacity: 0.4,
          animation: "whatsapp-pulse 2s infinite",
          pointerEvents: "none",
        }}
      />
      <style jsx global>{`
        @keyframes whatsapp-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
