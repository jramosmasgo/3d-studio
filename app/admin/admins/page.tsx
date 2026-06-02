"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  type Admin,
  type AdminType,
} from "@/lib/firebase/admins-service";

// ── Componente Skeleton ──────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-xl animate-pulse">
      <div className="p-6 pb-4 border-b border-outline-variant/5 bg-surface-container-highest/20 flex gap-4 items-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-highest shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-surface-container-highest rounded-lg" />
          <div className="h-3 w-20 bg-surface-container-highest/60 rounded-full" />
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div className="h-3 w-full bg-surface-container-highest/60 rounded" />
        <div className="h-3 w-3/4 bg-surface-container-highest/60 rounded" />
        <div className="h-3 w-1/2 bg-surface-container-highest/60 rounded" />
      </div>
      <div className="px-6 py-4 bg-surface-container-highest/20 border-t border-outline-variant/5 flex gap-2">
        <div className="flex-1 h-9 bg-surface-container-highest rounded-lg" />
        <div className="flex-1 h-9 bg-surface-container-highest rounded-lg" />
        <div className="w-9 h-9 bg-surface-container-highest rounded-lg" />
      </div>
    </div>
  );
}

// ── Componente Principal ─────────────────────────────────────────────────────

export default function AdminsPage() {
  // ── Datos ──────────────────────────────────────────────────────────────────
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // ── Modal ──────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<AdminType>("ADMIN");
  const [imageProfile, setImageProfile] = useState("");
  const [active, setActive] = useState(true);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error("Error cargando administradores:", err);
      showToast("Error al cargar los administradores.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // ── Abrir modal crear ──────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setName("");
    setSurname("");
    setEmail("");
    setPhoneNumber("");
    setType("ADMIN");
    setImageProfile("");
    setActive(true);
    setIsModalOpen(true);
  };

  // ── Abrir modal editar ─────────────────────────────────────────────────────
  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setSurname(admin.surname);
    setEmail(admin.email);
    setPhoneNumber(admin.phoneNumber);
    setType(admin.type);
    setImageProfile(admin.imageProfile);
    setActive(admin.active);
    setIsModalOpen(true);
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Omit<Admin, "id"> = {
      name,
      surname,
      email,
      phoneNumber,
      type,
      imageProfile: imageProfile.trim(),
      active,
    };

    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, payload);
        setAdmins((prev) =>
          prev.map((a) =>
            a.id === editingAdmin.id ? { ...a, ...payload } : a
          )
        );
        showToast("Administrador actualizado correctamente.", "success");
      } else {
        const nuevo = await createAdmin(payload);
        setAdmins((prev) =>
          [...prev, nuevo].sort((a, b) => a.name.localeCompare(b.name))
        );
        showToast("Administrador creado correctamente.", "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error guardando administrador:", err);
      showToast("Error al guardar. Intenta de nuevo.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Alternar activo/inactivo ───────────────────────────────────────────────
  const handleToggleActive = async (admin: Admin) => {
    const newActive = !admin.active;
    // Optimistic update
    setAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, active: newActive } : a))
    );
    try {
      await updateAdmin(admin.id, { active: newActive });
      showToast(
        newActive ? "Administrador activado." : "Administrador desactivado.",
        "success"
      );
    } catch (err) {
      // Revertir
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, active: admin.active } : a))
      );
      showToast("Error al cambiar el estado.", "error");
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const handleDelete = async (admin: Admin) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar a ${admin.name} ${admin.surname}? Esta acción no se puede deshacer.`
      )
    )
      return;

    setDeleting(admin.id);
    try {
      await deleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      showToast("Administrador eliminado.", "success");
    } catch (err) {
      console.error("Error eliminando administrador:", err);
      showToast("Error al eliminar. Intenta de nuevo.", "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const filteredAdmins = admins.filter((admin) => {
    const fullName = `${admin.name} ${admin.surname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phoneNumber.includes(searchQuery);

    const matchesRole = roleFilter === "ALL" || admin.type === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 sm:space-y-8">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold font-headline tracking-tighter uppercase">
            Administradores
          </h1>
          <p className="text-on-surface/40 text-xs sm:text-sm font-body">
            Gestiona los roles, accesos e información del personal administrativo de la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!loading && (
            <button
              onClick={loadAdmins}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 border border-outline-variant/20 text-on-surface/40 hover:text-on-surface rounded-xl hover:bg-surface-container-highest transition-all"
              title="Recargar"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-container hover:brightness-110 text-white font-bold uppercase tracking-wider text-xs px-6 py-4 rounded-xl shadow-lg shadow-primary-container/20 transition-all hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-lg">add_moderator</span>
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface-container-low p-4 sm:p-6 rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest border-none pl-12 pr-4 py-3 rounded-xl text-sm text-on-surface placeholder:text-on-surface/20 outline-none focus:ring-1 focus:ring-primary-container/50 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { key: "ALL", label: "Todos" },
              { key: "SUPERADMIN", label: "Super Admin" },
              { key: "ADMIN", label: "Administrador" },
            ] as { key: string; label: string }[]
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setRoleFilter(filter.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${
                  roleFilter === filter.key
                    ? "bg-primary-container text-white shadow-md shadow-primary-container/25"
                    : "bg-surface-container-highest text-on-surface/45 hover:text-on-surface hover:bg-surface-container-highest/80"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredAdmins.length === 0 ? (
          <div className="col-span-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-16 flex flex-col items-center justify-center text-center shadow-xl">
            <span className="material-symbols-outlined text-5xl text-on-surface/10 mb-3">
              admin_panel_settings
            </span>
            <p className="text-on-surface/30 text-sm font-body">
              {admins.length === 0
                ? "No hay administradores registrados. Crea el primero."
                : "No se encontraron administradores con ese filtro."}
            </p>
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const isBeingDeleted = deleting === admin.id;
            const initials = `${admin.name?.[0] ?? ""}${admin.surname?.[0] ?? ""}`.toUpperCase();

            return (
              <div
                key={admin.id}
                className={`bg-surface-container-low rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl
                  ${
                    admin.active
                      ? "border-outline-variant/10 hover:border-primary-container/30"
                      : "border-red-500/10 opacity-70"
                  }
                  ${isBeingDeleted ? "scale-95 opacity-40 pointer-events-none" : ""}`}
              >
                {/* Cabecera con avatar */}
                <div className="p-6 pb-4 border-b border-outline-variant/5 bg-surface-container-highest/20 flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-outline-variant/10 bg-surface-container-highest flex items-center justify-center shrink-0">
                    {admin.imageProfile ? (
                      <Image
                        src={admin.imageProfile}
                        alt={`${admin.name} ${admin.surname}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      <span className="text-lg font-bold text-on-surface/30 font-headline">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h3 className="font-headline font-bold text-base text-on-surface truncate">
                      {admin.name} {admin.surname}
                    </h3>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase border
                          ${
                            admin.type === "SUPERADMIN"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                      >
                        {admin.type === "SUPERADMIN" ? "Super Admin" : "Admin"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase border
                          ${
                            admin.active
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                      >
                        {admin.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="p-6 space-y-3 flex-grow">
                  <div className="flex justify-between items-center py-1 border-b border-outline-variant/5">
                    <span className="text-on-surface/40 font-label uppercase text-[9px] tracking-wider">
                      Email
                    </span>
                    <span
                      className="font-bold text-on-surface/85 text-xs truncate max-w-[200px]"
                      title={admin.email}
                    >
                      {admin.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-outline-variant/5">
                    <span className="text-on-surface/40 font-label uppercase text-[9px] tracking-wider">
                      Teléfono
                    </span>
                    <span className="font-bold text-on-surface/85 text-xs font-mono">
                      {admin.phoneNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface/40 font-label uppercase text-[9px] tracking-wider">
                      ID
                    </span>
                    <code className="text-[10px] text-primary-container bg-surface-container-highest px-2 py-0.5 rounded font-mono truncate max-w-[150px]">
                      {admin.id}
                    </code>
                  </div>
                </div>

                {/* Acciones */}
                <div className="px-6 py-4 bg-surface-container-highest/20 border-t border-outline-variant/5 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(admin)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg border transition-all
                      ${
                        admin.active
                          ? "text-red-400 border-red-500/10 hover:bg-red-500/10"
                          : "text-green-400 border-green-500/10 hover:bg-green-500/10"
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {admin.active ? "block" : "check_circle"}
                    </span>
                    {admin.active ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(admin)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2.5 bg-surface-container-highest text-on-surface/80 hover:text-on-surface border border-outline-variant/10 rounded-lg hover:bg-surface-container-highest/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(admin)}
                    disabled={isBeingDeleted}
                    className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg transition-all disabled:opacity-40"
                    title="Eliminar"
                  >
                    {isBeingDeleted ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">delete</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !saving && setIsModalOpen(false)}
          />

          {/* Caja */}
          <div className="relative z-10 w-full max-w-md bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/80 backdrop-blur-md">
              <h2 className="text-base font-bold font-headline uppercase tracking-wider">
                {editingAdmin ? "Editar Administrador" : "Nuevo Administrador"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="w-8 h-8 rounded-full hover:bg-surface-container-highest/60 flex items-center justify-center transition-colors text-on-surface/40 hover:text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4 flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Jean"
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Ej. Ramos"
                    className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@correo.com"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body disabled:opacity-50"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Teléfono / Celular
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="987578654"
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body disabled:opacity-50"
                  disabled={saving}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  Rol / Nivel de Acceso
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AdminType)}
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface outline-none transition-all text-sm font-body cursor-pointer disabled:opacity-50"
                  disabled={saving}
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase ml-1 font-label">
                  URL de Foto de Perfil
                </label>
                <input
                  type="url"
                  value={imageProfile}
                  onChange={(e) => setImageProfile(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-container-highest border-none px-4 py-3 rounded-xl focus:ring-1 focus:ring-primary-container/50 text-on-surface placeholder:text-on-surface/10 outline-none transition-all text-sm font-body disabled:opacity-50"
                  disabled={saving}
                />
              </div>

              {/* Toggle activo */}
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface/30 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container peer-checked:after:bg-white" />
                  <span className="ml-3 text-xs font-bold uppercase tracking-wider text-on-surface/75">
                    {active ? "Acceso Habilitado" : "Acceso Deshabilitado"}
                  </span>
                </label>
              </div>

              {/* Acciones del modal */}
              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/10 text-on-surface/60 hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                  )}
                  {saving ? "Guardando…" : editingAdmin ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
