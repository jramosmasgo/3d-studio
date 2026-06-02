"use client";

import { useState, useRef, useCallback, useId } from "react";
import Image from "next/image";

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface ImageUploaderProps {
  /** Carpeta en Cloudinary donde se guardará la imagen */
  folder?: string;
  /** Callback con la URL pública cuando la subida es exitosa */
  onUpload?: (result: UploadResult) => void;
  /** URL de imagen actual para mostrar como preview inicial */
  currentImageUrl?: string;
  /** Label del input */
  label?: string;
}

export default function ImageUploader({
  folder = "studio3d",
  onUpload,
  currentImageUrl,
  label = "Imagen del Producto",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Sincronizar el preview si la prop currentImageUrl cambia externamente (ej: al abrir otra sección o guardar)
  useState(() => {
    if (currentImageUrl !== undefined) {
      setPreview(currentImageUrl || null);
    }
  });

  // Usamos useEffect para escuchar cambios en currentImageUrl
  const [lastUrl, setLastUrl] = useState(currentImageUrl);
  if (currentImageUrl !== lastUrl) {
    setPreview(currentImageUrl || null);
    setLastUrl(currentImageUrl);
  }

  const handleFile = useCallback(
    async (file: File) => {
      // Preview local inmediato
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setStatus("uploading");
      setProgress(0);
      setErrorMsg(null);

      // Simular progreso mientras sube
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 85));
      }, 200);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Error al subir la imagen.");
        }

        setProgress(100);
        setStatus("success");
        onUpload?.(data as UploadResult);

        // Reemplazar object URL con URL pública de Cloudinary
        URL.revokeObjectURL(objectUrl);
        setPreview(data.url);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error desconocido.";
        setErrorMsg(msg);
        setStatus("error");
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      } finally {
        clearInterval(interval);
      }
    },
    [folder, onUpload]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label"
        >
          {label}
        </label>
      )}

      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging
            ? "border-primary-container bg-primary-container/10 scale-[1.01]"
            : preview
            ? "border-outline-variant/20 bg-surface-container-highest"
            : "border-outline-variant/20 bg-surface-container-highest hover:border-primary-container/40 hover:bg-surface-container-highest/80"
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de imagen"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {/* Preview de imagen */}
        {preview ? (
          <div className="relative w-full aspect-video">
            <Image
              src={preview}
              alt="Vista previa de la imagen"
              fill
              className="object-contain p-2"
              unoptimized={preview.startsWith("blob:")}
            />
            {/* Overlay al hacer hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-white text-2xl">upload</span>
              <span className="text-white text-sm font-bold">Cambiar imagen</span>
            </div>
          </div>
        ) : (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-3xl text-primary-container">
                {isDragging ? "file_download" : "add_photo_alternate"}
              </span>
            </div>
            <div>
              <p className="font-bold text-on-surface/70 text-sm">
                {isDragging ? "Suelta para subir" : "Arrastra o haz clic para subir"}
              </p>
              <p className="text-on-surface/30 text-xs mt-1">
                JPEG, PNG, WEBP o GIF · máx. 10 MB
              </p>
            </div>
          </div>
        )}

        {/* Barra de progreso */}
        {status === "uploading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest">
            <div
              className="h-full bg-primary-container transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleInputChange}
          aria-label="Seleccionar imagen"
        />
      </div>

      {/* Estados de feedback */}
      {status === "uploading" && (
        <p className="text-xs text-primary-container flex items-center gap-1.5 ml-1">
          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          Subiendo imagen… {progress}%
        </p>
      )}
      {status === "success" && (
        <p className="text-xs text-green-400 flex items-center gap-1.5 ml-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Imagen subida exitosamente
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 ml-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
