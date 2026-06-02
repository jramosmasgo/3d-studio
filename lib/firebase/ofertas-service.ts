import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type DiscountType = "percentage" | "money";
export type TargetType = "tags" | "category" | "all";

export interface Oferta {
  id?: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  targetType: TargetType;
  tags: string[];          // nombres de tags (ej. ["dragon", "fantasy"])
  category?: string;       // nombre de categoría (solo si targetType === "category")
  startDate: string;       // ISO date string "YYYY-MM-DD"
  endDate: string;         // ISO date string "YYYY-MM-DD"
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Colección ─────────────────────────────────────────────────────────────────

const OFERTAS_COL = "ofertas";

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getOfertas(): Promise<Oferta[]> {
  const q = query(collection(db, OFERTAS_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Oferta));
}

export async function createOferta(data: Omit<Oferta, "id">): Promise<Oferta> {
  const ref = await addDoc(collection(db, OFERTAS_COL), {
    ...data,
    isActive: false,          // siempre se crea en false
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, isActive: false };
}

export async function updateOferta(
  id: string,
  data: Partial<Omit<Oferta, "id">>
): Promise<void> {
  await updateDoc(doc(db, OFERTAS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOferta(id: string): Promise<void> {
  await deleteDoc(doc(db, OFERTAS_COL, id));
}
