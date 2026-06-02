// lib/cloudinary-upload.ts
// Servicio cliente para subir imágenes a Cloudinary via la API route del servidor
// Nunca expone el API Secret al cliente — siempre pasa por /api/upload

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Sube un archivo de imagen a Cloudinary a través de la API route segura del servidor.
 * Admite un callback opcional para rastrear el progreso de la subida.
 *
 * @param file      Archivo a subir (validado localmente antes de enviarse)
 * @param folder    Carpeta de destino en Cloudinary (default: "studio3d")
 * @param onProgress Callback con el porcentaje de progreso (0–100)
 */
export async function uploadImage(
  file: File,
  folder: string = "studio3d",
  onProgress?: (event: UploadProgressEvent) => void
): Promise<UploadResult> {
  // ── Validaciones locales ──────────────────────────────────────────────────
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido. Usa JPEG, PNG, WEBP o GIF.");
  }

  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
  }

  // ── Construir FormData ────────────────────────────────────────────────────
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // ── Subir con rastreo de progreso (XMLHttpRequest) ────────────────────────
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Rastrear progreso si se proveyó el callback
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.round((event.loaded / event.total) * 100),
          });
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadResult & {
            error?: string;
          };
          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data);
          }
        } catch {
          reject(new Error("Respuesta inválida del servidor."));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(data.error ?? `Error HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Error HTTP ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Error de red al subir la imagen.")));
    xhr.addEventListener("abort", () => reject(new Error("La subida fue cancelada.")));

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
}

/**
 * Formatea bytes en una cadena legible (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
