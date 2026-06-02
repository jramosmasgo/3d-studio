import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface Categoria {
  id: string;
  id_categoria?: number;
  nombre: string;
  slug: string;
  descripcion: string;
  active: boolean;
}

export interface Tag {
  id: string;
  id_tag?: number;
  nombre: string;
  slug: string;
  active: boolean;
}

export interface Material {
  id: string;
  id_material?: number;
  nombre: string;
  abreviatura: string;
  active: boolean;
}

// ── Helper ───────────────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapDoc<T>(doc: DocumentData & { id: string }): T {
  const { id, ...data } = doc;
  return { id, ...data } as T;
}

// ── CATEGORÍAS ───────────────────────────────────────────────────────────────

const CATEGORIAS_COL = "categorias";

export async function getCategorias(): Promise<Categoria[]> {
  const q = query(collection(db, CATEGORIAS_COL), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Categoria));
}

export async function createCategoria(
  data: Omit<Categoria, "id">
): Promise<Categoria> {
  const ref = await addDoc(collection(db, CATEGORIAS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function updateCategoria(
  id: string,
  data: Partial<Omit<Categoria, "id">>
): Promise<void> {
  await updateDoc(doc(db, CATEGORIAS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── TAGS ─────────────────────────────────────────────────────────────────────

const TAGS_COL = "tags";

export async function getTags(): Promise<Tag[]> {
  const q = query(collection(db, TAGS_COL), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tag));
}

export async function createTag(data: Omit<Tag, "id">): Promise<Tag> {
  const ref = await addDoc(collection(db, TAGS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function updateTag(
  id: string,
  data: Partial<Omit<Tag, "id">>
): Promise<void> {
  await updateDoc(doc(db, TAGS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── MATERIALES ───────────────────────────────────────────────────────────────

const MATERIALES_COL = "materiales";

export async function getMateriales(): Promise<Material[]> {
  const q = query(collection(db, MATERIALES_COL), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Material));
}

export async function createMaterial(
  data: Omit<Material, "id">
): Promise<Material> {
  const ref = await addDoc(collection(db, MATERIALES_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function updateMaterial(
  id: string,
  data: Partial<Omit<Material, "id">>
): Promise<void> {
  await updateDoc(doc(db, MATERIALES_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
