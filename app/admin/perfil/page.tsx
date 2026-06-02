"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateAdmin, type Admin } from "@/lib/firebase/admins-service";
import { uploadImage, formatFileSize, type UploadProgressEvent } from "@/lib/cloudinary-upload";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: "success" | "error";
}

type UploadState = "idle" | "uploading" | "done" | "error";

// ── Componente Principal ──────────────────────────────────────────────────────

export default function PerfilPage() {
  const { adminProfile, updateProfileInContext } = useAuth();

  // Estados del formulario
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageProfile, setImageProfile] = useState("");

  // Estados de UI del formulario
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Estados del uploader de imagen
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del perfil
  useEffect(() => {
    if (adminProfile) {
      setName(adminProfile.name || "");
      setSurname(adminProfile.surname || "");
      setPhoneNumber(adminProfile.phoneNumber || "");
      setImageProfile(adminProfile.imageProfile || "");
    }
  }, [adminProfile]);

  // ── Utilidades ─────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Iniciales para el avatar (reactivo a los campos del formulario)
  const initials = `${name.slice(0, 1)}${surname.slice(0, 1)}`.toUpperCase() || "AD";

  // ── Lógica del Uploader ────────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File) => {
      // Validación local rápida de tipo
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        showToast("Solo se permiten imágenes JPEG, PNG, WEBP o GIF.", "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("El archivo supera el límite de 10 MB.", "error");
        return;
      }

      // Crear preview local inmediato
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setUploadedFileInfo({ name: file.name, size: formatFileSize(file.size) });
      setUploadState("uploading");
      setUploadProgress(0);

      try {
        const result = await uploadImage(
          file,
          "studio3d/admins",
          (event: UploadProgressEvent) => {
            setUploadProgress(event.percent);
          }
        );

        // Éxito: actualizar el campo con la URL de Cloudinary
        setImageProfile(result.url);
        setUploadState("done");
        setUploadProgress(100);
        showToast("Imagen subida correctamente. Guarda el perfil para aplicarla.", "success");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Error al subir la imagen.";
        setUploadState("error");
        showToast(msg, "error");
        // Limpiar el preview en caso de error
        setPreviewUrl(null);
        URL.revokeObjectURL(localPreview);
      }
    },
    [showToast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Resetear el input para permitir subir el mismo archivo de nuevo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveUploadedImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedFileInfo(null);
    setUploadState("idle");
    setUploadProgress(0);
    // Restaurar la URL original del perfil
    setImageProfile(adminProfile?.imageProfile || "");
  };

  // La imagen mostrada en el avatar: priorizar preview local → campo imageProfile
  const displayImage = previewUrl || imageProfile || null;

  // ── Guardar Perfil ─────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile) return;
    if (!name.trim() || !surname.trim()) {
      showToast("El nombre y apellido son obligatorios.", "error");
      return;
    }
    if (uploadState === "uploading") {
      showToast("Espera a que termine de subir la imagen.", "error");
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        name: name.trim(),
        surname: surname.trim(),
        phoneNumber: phoneNumber.trim(),
        imageProfile: imageProfile.trim(),
      };

      await updateAdmin(adminProfile.id, updatedData);

      const fullUpdatedProfile: Admin = { ...adminProfile, ...updatedData };
      updateProfileInContext(fullUpdatedProfile);

      // Limpiar el estado del uploader al guardar con éxito
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setUploadedFileInfo(null);
      setUploadState("idle");
      setUploadProgress(0);

      showToast("Perfil actualizado correctamente.", "success");
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      showToast("Ocurrió un error al guardar los cambios.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Skeleton de Carga ──────────────────────────────────────────────────────

  if (!adminProfile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
          progress_activity
        </span>
        <p className="text-on-surface/40 text-sm font-label tracking-widest uppercase">
          Cargando perfil…
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all duration-300 animate-in slide-in-from-top-2
            ${
              toast.type === "success"
                ? "bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-md"
                : "bg-red-500/10 text-red-400 border-red-500/20 backdrop-blur-md"
            }`}
          role="alert"
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-4xl font-bold font-headline tracking-tighter uppercase">
          Mi Perfil
        </h1>
        <p className="text-on-surface/40 text-xs sm:text-sm font-body">
          Administra tus datos personales, información de contacto y foto de perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Columna Izquierda: Tarjeta Visual ────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Tarjeta de Perfil */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
            
            {/* Avatar interactivo */}
            <div className="relative group">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-outline-variant/15 bg-surface-container-highest flex items-center justify-center shrink-0 transition-all duration-300 group-hover:border-primary-container/40">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={`${name} ${surname}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-headline font-bold text-primary-container select-none">
                    {initials}
                  </span>
                )}

                {/* Overlay de carga sobre el avatar */}
                {uploadState === "uploading" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                    <span className="material-symbols-outlined text-white animate-spin text-2xl">
                      progress_activity
                    </span>
                  </div>
                )}
              </div>

              {/* Botón flotante de cambio de foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState === "uploading" || saving}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary-container hover:brightness-110 border-2 border-[#0e0e0e] flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cambiar foto de perfil"
              >
                <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
              </button>
            </div>

            {/* Nombre y Rol */}
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {name} {surname}
              </h3>
              <p className="text-on-surface/40 text-xs font-mono lowercase break-all">
                {adminProfile.email}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  adminProfile.type === "SUPERADMIN"
                    ? "bg-primary-container/10 text-primary-container border-primary-container/20"
                    : "bg-surface-container-highest text-on-surface/60 border-outline-variant/10"
                }`}
              >
                {adminProfile.type}
              </span>
              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  adminProfile.active
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {adminProfile.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-2 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-container font-label flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">security</span>
              Seguridad de la Cuenta
            </h4>
            <p className="text-xs text-on-surface/50 leading-relaxed font-body">
              El correo electrónico está vinculado a Firebase Authentication y no puede modificarse desde aquí por motivos de seguridad.
            </p>
          </div>
        </div>

        {/* ── Columna Derecha: Formulario ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─ Uploader de Imagen ─────────────────────────────────────────── */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
            <h3 className="text-base font-bold font-headline uppercase tracking-wider border-b border-outline-variant/5 pb-3">
              Foto de Perfil
            </h3>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadState === "uploading" || saving}
            />

            {/* Zona de Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                uploadState !== "uploading" && !saving && fileInputRef.current?.click()
              }
              className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none
                ${isDragOver
                  ? "border-primary-container bg-primary-container/5 scale-[1.01]"
                  : uploadState === "uploading"
                  ? "border-primary-container/30 bg-primary-container/5 cursor-not-allowed"
                  : uploadState === "done"
                  ? "border-green-500/30 bg-green-500/5"
                  : uploadState === "error"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-outline-variant/20 hover:border-primary-container/40 hover:bg-surface-container-highest/30"
                }`}
            >
              {uploadState === "uploading" ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-primary-container animate-pulse">
                    cloud_upload
                  </span>
                  <p className="text-sm font-bold text-primary-container">
                    Subiendo imagen… {uploadProgress}%
                  </p>
                  {/* Barra de progreso */}
                  <div className="w-full max-w-xs bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadedFileInfo && (
                    <p className="text-[11px] text-on-surface/40 font-mono">
                      {uploadedFileInfo.name} — {uploadedFileInfo.size}
                    </p>
                  )}
                </>
              ) : uploadState === "done" ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-green-400">
                      check_circle
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-green-400">Imagen lista</p>
                      {uploadedFileInfo && (
                        <p className="text-[11px] text-on-surface/40 font-mono">
                          {uploadedFileInfo.name} — {uploadedFileInfo.size}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUploadedImage();
                    }}
                    className="text-[11px] text-on-surface/40 hover:text-red-400 font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                    Quitar imagen
                  </button>
                </>
              ) : uploadState === "error" ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-red-400">
                    error
                  </span>
                  <p className="text-sm font-bold text-red-400">Error al subir</p>
                  <p className="text-xs text-on-surface/40">
                    Haz clic para intentar de nuevo
                  </p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface/20 group-hover:text-primary-container transition-colors">
                    add_photo_alternate
                  </span>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-on-surface/60">
                      Arrastra tu foto aquí
                    </p>
                    <p className="text-xs text-on-surface/30">
                      o{" "}
                      <span className="text-primary-container underline underline-offset-2">
                        haz clic para seleccionar
                      </span>
                    </p>
                  </div>
                  <p className="text-[10px] text-on-surface/20 font-mono uppercase tracking-widest">
                    JPEG · PNG · WEBP · GIF · Máx. 10 MB
                  </p>
                </>
              )}
            </div>

            {/* Preview de la imagen actual (si existe y no hay una nueva subida activa) */}
            {displayImage && uploadState !== "uploading" && (
              <div className="flex items-center gap-4 p-3 bg-surface-container-highest/50 rounded-xl border border-outline-variant/10">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-outline-variant/10">
                  <Image
                    src={displayImage}
                    alt="Preview"
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-on-surface/80 truncate">
                    {uploadState === "done" ? "Nueva imagen seleccionada" : "Imagen actual del perfil"}
                  </p>
                  <p className="text-[10px] text-on-surface/30 font-mono truncate">{displayImage}</p>
                </div>
              </div>
            )}
          </div>

          {/* ─ Datos Personales ───────────────────────────────────────────── */}
          <form
            onSubmit={handleSave}
            className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <h3 className="text-base font-bold font-headline uppercase tracking-wider border-b border-outline-variant/5 pb-3">
              Datos Personales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-body transition-all disabled:opacity-50"
                  required
                  disabled={saving}
                />
              </div>

              {/* Apellido */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Apellido
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-body transition-all disabled:opacity-50"
                  required
                  disabled={saving}
                />
              </div>

              {/* Correo (solo lectura) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label flex items-center gap-1">
                  Correo Electrónico
                  <span className="material-symbols-outlined text-xs text-on-surface/30">lock</span>
                </label>
                <input
                  type="email"
                  value={adminProfile.email}
                  disabled
                  className="w-full bg-surface-container-highest/40 border border-outline-variant/5 px-4 py-3 rounded-xl text-on-surface/40 outline-none text-sm font-mono cursor-not-allowed select-none"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Número Telefónico
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ej. +51 987654321"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none text-sm font-body transition-all disabled:opacity-50"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end pt-4 border-t border-outline-variant/10">
              <button
                type="submit"
                id="btn-guardar-perfil"
                disabled={saving || uploadState === "uploading"}
                className="flex items-center gap-2 px-6 py-4 rounded-xl bg-primary-container hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Guardando cambios…
                  </>
                ) : uploadState === "uploading" ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Subiendo imagen…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Guardar Perfil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
