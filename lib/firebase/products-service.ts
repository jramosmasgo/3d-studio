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
  getDoc,
  increment,
  where,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  es_principal: boolean;
  orden: number;
  alt_text: string;
}

export interface Product {
  id?: string;

  // Información principal
  name: string;
  description: string;

  // Precio
  price: number;

  // Clasificación
  categoryId: string;
  categoryName?: string;

  // Material de impresión
  material: string;

  // Estado de disponibilidad
  availability: boolean;

  // Imágenes (máx. 4 según el diseño)
  images: ProductImage[];

  // Tags separados por comas
  tags: string[];

  // Estado activo/inactivo
  isActive: boolean;

  // Vistas (contador de clics/visitas)
  views?: number;

  // Fechas opcionales
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
}

// ── Colección ─────────────────────────────────────────────────────────────────

const PRODUCTS_COL = "productos";

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  const ref = await addDoc(collection(db, PRODUCTS_COL), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data, views: 0 };
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function incrementProductViews(id: string): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COL, id), {
    views: increment(1),
  });
}

export async function getRelatedProducts(currentProductId: string, categoryId: string, tags: string[] = []): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COL),
    where("categoryId", "==", categoryId),
    limit(20) // Limit to 20 to find some matches
  );
  
  const snap = await getDocs(q);
  const products = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .filter(p => p.id !== currentProductId && p.isActive);

  // Ordenar por número de tags coincidentes (mayor coincidencia primero)
  products.sort((a, b) => {
    const aTags = a.tags || [];
    const bTags = b.tags || [];
    const aMatches = aTags.filter(t => tags.includes(t)).length;
    const bMatches = bTags.filter(t => tags.includes(t)).length;
    return bMatches - aMatches;
  });

  return products.slice(0, 3);
}
