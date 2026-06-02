"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getAdminByEmail, type Admin } from "@/lib/firebase/admins-service";

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  adminProfile: Admin | null;      // Perfil completo de Firestore
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileInContext: (updatedProfile: Admin) => void;
}

// ── Claves de almacenamiento ───────────────────────────────────────────────────

const STORAGE_KEY_USER    = "studio3d_auth_user";
const STORAGE_KEY_PROFILE = "studio3d_admin_profile";

// ── Helpers localStorage ───────────────────────────────────────────────────────

function persistUser(user: AuthUser): void {
  try { localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)); } catch { /* SSR */ }
}

function getPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

function clearPersistedUser(): void {
  try { localStorage.removeItem(STORAGE_KEY_USER); } catch { /* noop */ }
}

// ── Helpers adminProfile (localStorage + sessionStorage) ──────────────────────

function persistAdminProfile(profile: Admin): void {
  try {
    const json = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEY_PROFILE, json);
    sessionStorage.setItem(STORAGE_KEY_PROFILE, json);
  } catch { /* SSR */ }
}

function getPersistedAdminProfile(): Admin | null {
  try {
    // Priorizar sessionStorage (más seguro, se borra al cerrar el tab)
    const raw =
      sessionStorage.getItem(STORAGE_KEY_PROFILE) ??
      localStorage.getItem(STORAGE_KEY_PROFILE);
    return raw ? (JSON.parse(raw) as Admin) : null;
  } catch { return null; }
}

function clearPersistedAdminProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    sessionStorage.removeItem(STORAGE_KEY_PROFILE);
  } catch { /* noop */ }
}

// ── Contexto ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getPersistedUser();
  });

  const [adminProfile, setAdminProfile] = useState<Admin | null>(() => {
    if (typeof window === "undefined") return null;
    return getPersistedAdminProfile();
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar con Firebase Auth en tiempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
        };
        setUser(authUser);
        persistUser(authUser);

        // Si no tenemos el perfil en memoria, intentar recuperarlo del storage
        const cached = getPersistedAdminProfile();
        if (cached && cached.email === firebaseUser.email) {
          setAdminProfile(cached);
        }
      } else {
        setUser(null);
        setAdminProfile(null);
        clearPersistedUser();
        clearPersistedAdminProfile();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── signIn con validación en colección admins ──────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    let firebaseUserCredential;

    try {
      // 1. Verificar credenciales con Firebase Auth
      firebaseUserCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(mapFirebaseError(firebaseError.code));
      setLoading(false);
      throw err;
    }

    try {
      // 2. Buscar al usuario en la colección admins de Firestore
      const profile = await getAdminByEmail(email);

      if (!profile) {
        // El correo no está registrado como admin → rechazar acceso
        await firebaseSignOut(auth);
        setUser(null);
        setAdminProfile(null);
        clearPersistedUser();
        clearPersistedAdminProfile();
        const denyErr = new Error("ACCESS_DENIED");
        setError("Tu cuenta no tiene acceso al panel de administración.");
        setLoading(false);
        throw denyErr;
      }

      if (profile.active === false) {
        // Admin registrado pero deshabilitado
        await firebaseSignOut(auth);
        setUser(null);
        setAdminProfile(null);
        clearPersistedUser();
        clearPersistedAdminProfile();
        const denyErr = new Error("ACCOUNT_DISABLED");
        setError("Tu cuenta de administrador está deshabilitada. Contacta al Super Admin.");
        setLoading(false);
        throw denyErr;
      }

      // 3. Acceso concedido — guardar perfil completo
      const fUser = firebaseUserCredential.user;
      const authUser: AuthUser = {
        uid:         fUser.uid,
        email:       fUser.email,
        displayName: fUser.displayName ?? `${profile.name} ${profile.surname}`,
        photoURL:    fUser.photoURL ?? profile.imageProfile ?? null,
      };

      setUser(authUser);
      setAdminProfile(profile);
      persistUser(authUser);
      persistAdminProfile(profile);

    } catch (err: unknown) {
      // Solo relanzar si no lo hemos manejado ya arriba
      const e = err as Error;
      if (e.message !== "ACCESS_DENIED" && e.message !== "ACCOUNT_DISABLED") {
        setError("Error al verificar los permisos. Intenta de nuevo.");
        await firebaseSignOut(auth);
        clearPersistedUser();
        clearPersistedAdminProfile();
      }
      setLoading(false);
      throw err;
    }

    setLoading(false);
  }, []);

  // ── signOut ────────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
      setAdminProfile(null);
      clearPersistedUser();
      clearPersistedAdminProfile();
    }
  }, []);

  // ── updateProfileInContext ──────────────────────────────────────────────────

  const updateProfileInContext = useCallback((updatedProfile: Admin) => {
    setAdminProfile(updatedProfile);
    persistAdminProfile(updatedProfile);

    // Sincronizar también con el estado de usuario para actualizar avatar/nombre
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser: AuthUser = {
        ...prev,
        displayName: `${updatedProfile.name} ${updatedProfile.surname}`,
        photoURL: updatedProfile.imageProfile || null,
      };
      persistUser(updatedUser);
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, adminProfile, loading, error, signIn, signOut, updateProfileInContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

// ── Mapeo de errores Firebase ──────────────────────────────────────────────────

function mapFirebaseError(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta más tarde.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    case "auth/network-request-failed":
      return "Error de conexión. Verifica tu internet.";
    default:
      return "Ocurrió un error al iniciar sesión.";
  }
}
