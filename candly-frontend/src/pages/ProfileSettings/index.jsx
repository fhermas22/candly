/**
 * ProfileSettings
 * Candly – Candidate profile settings page.
 * Sections: personal info form, photo upload, CV drag-and-drop.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { auth } from "../../utils/auth";
import { useNotifications } from "../../hooks/useNotifications";

// ─── Constants ────────────────────────────────────────────────────────────────
const CV_MAX_SIZE_MB = 5;
const ACCEPTED_IMG   = ["image/jpeg", "image/png", "image/webp"];

// ─── Initial profile state builder ────────────────────────────────────────────
const buildInitialProfile = () => {
  const storedUser = auth.getUser();
  return {
    firstName:   storedUser?.profile?.first_name || "",
    lastName:    storedUser?.profile?.last_name || "",
    email:       storedUser?.email || "",
    title:       "",
    bio:         storedUser?.profile?.bio || "",
    location:    "",
    linkedin:    "",
    initials:    storedUser?.avatarInitials || "CC",
    avatarColor: storedUser?.avatarColor || "#22D3EE",
    photoUrl:    storedUser?.profile?.photo_url || null,
    cvUrl:       storedUser?.profile?.cv_url || null,
  };
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "info",
    label: "Informations personnelles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Sécurité & mot de passe",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-5"
      style={{ color: "#475569" }}
    >
      {children}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return <input className="input-aura" {...props} />;
}

function Textarea({ ...props }) {
  return (
    <textarea
      className="input-aura"
      style={{ minHeight: "90px", lineHeight: 1.6, resize: "vertical" }}
      {...props}
    />
  );
}

/** Animated progress bar for profile completion */
function CompletionBar({ pct }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: "#64748b" }}>Progression du profil</span>
        <span className="text-xs font-semibold" style={{ color: "#22D3EE" }}>{pct}%</span>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(34,211,238,0.12)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#22D3EE,#10B981)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/** Avatar upload zone with glow hover */
function AvatarUpload({ initials, color, photoUrl, onUpload }) {
  const [isHovered, setIsHovered] = useState(false);
  const [glowing,   setGlowing]   = useState(false);
  const inputRef = useRef(null);
  const isDarkMode = document.documentElement.dataset.theme === 'dark';

  const handleClick = () => {
    setGlowing(true);
    setTimeout(() => setGlowing(false), 600);
    inputRef.current?.click();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMG.includes(file.type)) {
      alert("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }

    const url = URL.createObjectURL(file);
    onUpload({ file, url });
    console.log("[Candly] Avatar upload →", file.name);
  };

  return (
    <div className="relative">
      <motion.div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          boxShadow: glowing
            ? `0 0 32px ${color}99`
            : isHovered
            ? `0 0 20px ${color}66`
            : `0 0 0px ${color}00`,
        }}
        transition={{ duration: 0.25 }}
        className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
        style={{
          background: `${color}1a`,
          border: `2px solid ${color}55`,
        }}
      >
        {/* Photo or Initials */}
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading font-black text-3xl" style={{ color }}>
            {initials}
          </span>
        )}

        {/* Hover overlay */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
          style={{ background: isDarkMode ? "rgba(2,6,23,0.72)" : "rgba(15,23,42,0.75)" }}
        >
          <svg className="w-5 h-5 mb-1" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-xs font-semibold" style={{ color }}>Modifier</span>
        </motion.div>
      </motion.div>

      {/* + badge */}
      <div
        onClick={handleClick}
        className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "#22D3EE",
          border: "2px solid #020617",
          boxShadow: "0 0 8px rgba(34,211,238,0.5)",
        }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth={3}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/** CV drag-and-drop zone */
function CVUploadZone({ file, cvUrl, onUpload, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Veuillez téléverser un fichier PDF.");
      return;
    }
    if (f.size > CV_MAX_SIZE_MB * 1024 * 1024) {
      alert(`Taille maximale autorisée : ${CV_MAX_SIZE_MB} Mo.`);
      return;
    }

    onUpload({ file: f, name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) });
    console.log("[Candly] CV upload →", f.name);
  }, [onUpload]);

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // Show existing CV if no new file is being uploaded
  const displayedCV = file || (cvUrl ? { name: "CV uploadé", size: "—", cvUrl } : null);

  return (
    <div>
      <motion.div
        onClick={() => !displayedCV && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        animate={{
          borderColor: isDragging
            ? "rgba(34,211,238,0.55)"
            : "rgba(34,211,238,0.2)",
          background: isDragging
            ? "rgba(34,211,238,0.06)"
            : "rgba(34,211,238,0.02)",
          boxShadow: isDragging ? "0 0 24px rgba(34,211,238,0.08)" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl p-9 text-center cursor-pointer transition-colors"
        style={{ border: "2px dashed rgba(34,211,238,0.2)" }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "rgba(34,211,238,0.1)",
            border: "1px solid rgba(34,211,238,0.2)",
            boxShadow: "0 0 16px rgba(34,211,238,0.12)",
          }}
        >
          <svg className="w-6 h-6" style={{ color: "#22D3EE" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" />
            <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
            <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
          </svg>
        </div>

        <p className="font-heading font-bold text-sm mb-2" style={{ color: "#f1f5f9" }}>
          Déposez votre CV ici
        </p>
        <p className="text-xs leading-relaxed mb-5" style={{ color: "#64748b" }}>
          Glissez-déposez votre fichier PDF ou cliquez pour parcourir.<br />
          Taille maximale : <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{CV_MAX_SIZE_MB} Mo</span>
        </p>

        <button
          type="button"
          className="btn-secondary text-xs px-5 py-2.5"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" />
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
          </svg>
          Parcourir les fichiers
        </button>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />

      {/* Uploaded file preview */}
      <AnimatePresence>
        {displayedCV && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,185,129,0.12)" }}
            >
              <svg className="w-5 h-5" style={{ color: "#10B981" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{displayedCV.name}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {displayedCV.cvUrl ? "Téléversé" : `${displayedCV.size} Mo · Prêt à être téléversé`}
              </p>
            </div>
            {displayedCV.cvUrl && (
              <a
                href={displayedCV.cvUrl}
                download
                className="btn-secondary text-xs px-3 py-1.5 shrink-0"
              >
                Télécharger
              </a>
            )}
            {!displayedCV.cvUrl && (
              <button
                onClick={onRemove}
                className="btn-danger text-xs px-3 py-1.5 shrink-0"
              >
                Supprimer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const [activeNav, setActiveNav] = useState("info");
  const [profile, setProfile]     = useState(buildInitialProfile());
  const [photoFile, setPhotoFile] = useState(null);
  const [cvFile, setCVFile]       = useState(null);
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { pushNotification }      = useNotifications();

  // Load user profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.getUser();
        if (user && user.profile) {
          setProfile({
            firstName:   user.profile.first_name || "",
            lastName:    user.profile.last_name || "",
            email:       user.email || "",
            title:       "",
            bio:         user.profile.bio || "",
            location:    "",
            linkedin:    "",
            initials:    user.avatarInitials || "CC",
            avatarColor: user.avatarColor || "#22D3EE",
            photoUrl:    user.profile.photo_url || null,
            cvUrl:       user.profile.cv_url || null,
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const set = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  // Recompute completion based on filled fields
  const computeCompletion = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.title,
      profile.bio,
      profile.location,
      profile.photoUrl,
      profile.cvUrl,
    ];
    const filled  = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      if (photoFile) {
        formData.append("photo", photoFile);
      }
      if (cvFile?.file) {
        formData.append("cv", cvFile.file);
      }

      if (formData.has("photo") || formData.has("cv")) {
        const response = await api.post("/profile/media", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Update local state with response data
        if (response.data.profile) {
          setProfile((p) => ({
            ...p,
            photoUrl: response.data.profile.photo_url,
            cvUrl: response.data.profile.cv_url,
          }));
        }

        // Clear file uploads after successful upload
        setPhotoFile(null);
        setCVFile(null);
      }

      setSaved(true);
      pushNotification({ message: "Vos documents ont été enregistrés.", type: "success" });
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save profile media:", err);
      const errorMsg = err.response?.data?.message || "Impossible d'enregistrer les fichiers. Réessayez.";
      setError(errorMsg);
      pushNotification({ message: errorMsg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const completion = computeCompletion();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p style={{ color: "#64748b" }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-heading font-black text-2xl tracking-tight mb-1" style={{ color: "#f1f5f9" }}>
          Paramètres du profil
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Gérez vos informations personnelles et vos documents.
        </p>
      </motion.div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.1)", color: "#fecaca" }}>
          {error}
        </div>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns: "280px 1fr" }}>
        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-7"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <AvatarUpload
              initials={profile.initials}
              color={profile.avatarColor}
              photoUrl={photoFile ? URL.createObjectURL(photoFile) : profile.photoUrl}
              onUpload={(data) => {
                setPhotoFile(data.file);
              }}
            />
            <p className="font-heading font-bold text-sm mt-4 mb-0.5" style={{ color: "#f1f5f9" }}>
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs mb-5" style={{ color: "#64748b" }}>{profile.email}</p>
            <CompletionBar pct={completion} />
          </div>

          <hr className="divider-glow mb-5" />

          {/* Nav */}
          <SectionLabel>Navigation</SectionLabel>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color:      activeNav === item.id ? "#22D3EE" : "#94a3b8",
                  background: activeNav === item.id ? "rgba(34,211,238,0.08)" : "transparent",
                  border:     activeNav === item.id ? "1px solid rgba(34,211,238,0.18)" : "1px solid transparent",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* ── Right content ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Personal info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card p-7"
          >
            <SectionLabel>Informations personnelles</SectionLabel>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom">
                <Input placeholder="Hermas" value={profile.firstName} onChange={set("firstName")} />
              </Field>
              <Field label="Nom">
                <Input placeholder="Francisco" value={profile.lastName} onChange={set("lastName")} />
              </Field>
            </div>

            <Field label="Email">
              <Input type="email" placeholder="vous@exemple.com" value={profile.email} onChange={set("email")} disabled />
            </Field>

            <Field label="Intitulé du poste">
              <Input placeholder="Ex. Développeur Full-Stack · Paris" value={profile.title} onChange={set("title")} />
            </Field>

            <Field label="À propos">
              <Textarea
                placeholder="Parlez de votre expérience, de vos compétences clés et de vos objectifs professionnels..."
                value={profile.bio}
                onChange={set("bio")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Localisation">
                <Input placeholder="Paris, France" value={profile.location} onChange={set("location")} />
              </Field>
              <Field label="LinkedIn">
                <Input placeholder="linkedin.com/in/..." value={profile.linkedin} onChange={set("linkedin")} />
              </Field>
            </div>
          </motion.div>

          {/* CV upload card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card p-7"
          >
            <SectionLabel>Curriculum Vitae (PDF)</SectionLabel>
            <CVUploadZone
              file={cvFile}
              cvUrl={profile.cvUrl}
              onUpload={(f) => { setCVFile(f); }}
              onRemove={() => setCVFile(null)}
            />
          </motion.div>

          {/* Save row */}
          <div
            className="flex items-center justify-end gap-3 pt-2 pb-2"
            style={{ borderTop: "1px solid rgba(34,211,238,0.07)" }}
          >
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold"
                  style={{ color: "#10B981" }}
                >
                  ✓ Enregistré
                </motion.span>
              )}
            </AnimatePresence>
            <button
              className="btn-ghost text-sm"
              onClick={() => setProfile(buildInitialProfile())}
            >
              Annuler
            </button>
            <button className="btn-primary text-sm px-6 py-2.5" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
