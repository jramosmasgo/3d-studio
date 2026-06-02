import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type AdminType = "ADMIN" | "SUPERADMIN";

export interface Admin {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  type: AdminType;
  imageProfile: string;
  active: boolean;
}

// ── Colección ────────────────────────────────────────────────────────────────

const ADMINS_COL = "admins";

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAdmins(): Promise<Admin[]> {
  const q = query(collection(db, ADMINS_COL), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Admin));
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const q = query(
    collection(db, ADMINS_COL),
    where("email", "==", email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Admin;
}


export async function createAdmin(
  data: Omit<Admin, "id">
): Promise<Admin> {
  const ref = await addDoc(collection(db, ADMINS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

export async function updateAdmin(
  id: string,
  data: Partial<Omit<Admin, "id">>
): Promise<void> {
  await updateDoc(doc(db, ADMINS_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdmin(id: string): Promise<void> {
  await deleteDoc(doc(db, ADMINS_COL, id));
}
