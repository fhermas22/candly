/**
 * ProfileSettings
 * Candly – Candidate profile settings page.
 * Sections: personal info form, photo upload, CV drag-and-drop.
 *
 * TODO: wire up to PATCH /api/profile and POST /api/profile/avatar + /api/profile/cv
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../utils/auth";

// ─── Constants ────────────────────────────────────────────────────────────────
const CV_MAX_SIZE_MB = 5;
const ACCEPTED_IMG   = ["image/jpeg", "image/png", "image/webp"];

// ─── Mock initial data (replace with API response) ────────────────────────────
const storedUser = auth.getUser();
const MOCK_PROFILE = {
  firstName:   storedUser?.profile?.first_name || "Hermas",
  lastName:    storedUser?.profile?.last_name || "Francisco",
  email:       storedUser?.email || "hermas@candly.io",
  title:       "",
  bio:         storedUser?.profile?.bio || "",
  location:    "",
  linkedin:    "",
  initials:    storedUser?.avatarInitials || "HF",
  avatarColor: storedUser?.avatarColor || "#22D3EE",
  completion:  65,
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "info",
    label: "Personal Information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security & Password",
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
        <span className="text-xs" style={{ color: "#64748b" }}>Profile completion</span>
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
function AvatarUpload({ initials, color, onUpload }) {
  const [isHovered, setIsHovered] = useState(false);
  const [glowing,   setGlowing]   = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    setGlowing(true);
    setTimeout(() => setGlowing(false), 600);
    inputRef.current?.click();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMG.includes(file.type)) {
      alert("Unsupported format. Use JPG, PNG or WebP.");
      return;
    }
    // TODO: upload to POST /api/profile/avatar (FormData)
    const url = URL.createObjectURL(file);
    onUpload(url);
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
        {/* Initials */}
        <span className="font-heading font-black text-3xl" style={{ color }}>
          {initials}
        </span>

        {/* Hover overlay */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
          style={{ background: "rgba(2,6,23,0.72)" }}
        >
          <svg className="w-5 h-5 mb-1" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-xs font-semibold" style={{ color }}>Edit</span>
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
function CVUploadZone({ file, onUpload, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (f.size > CV_MAX_SIZE_MB * 1024 * 1024) {
      alert(`Maximum file size allowed is ${CV_MAX_SIZE_MB} MB.`);
      return;
    }
    // TODO: upload to POST /api/profile/cv (FormData)
    onUpload({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) });
    console.log("[Candly] CV upload →", f.name);
  }, [onUpload]);

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <motion.div
        onClick={() => !file && inputRef.current?.click()}
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
          Drop your CV here
        </p>
        <p className="text-xs leading-relaxed mb-5" style={{ color: "#64748b" }}>
          Drag & drop your PDF file or click to browse.<br />
          Maximum size: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{CV_MAX_SIZE_MB} MB</span>
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
          Browse files
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
        {file && (
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
              <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>{file.size} MB · Uploaded just now</p>
            </div>
            <button
              onClick={onRemove}
              className="btn-danger text-xs px-3 py-1.5 shrink-0"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const [activeNav, setActiveNav] = useState("info");
  const [profile, setProfile]     = useState(MOCK_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [cvFile, setCVFile]       = useState(null);
  const [saved, setSaved]         = useState(false);

  const set = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  // Recompute completion based on filled fields
  const computeCompletion = () => {
    const fields = [profile.firstName, profile.lastName, profile.email, profile.title, profile.bio, profile.location, avatarUrl, cvFile];
    const filled  = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSave = () => {
    // TODO: call PATCH /api/profile with profile state
    console.log("[Candly] Profile save →", profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const completion = computeCompletion();

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
          Profile Settings
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Manage your personal information and documents
        </p>
      </motion.div>

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
              onUpload={setAvatarUrl}
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
            <SectionLabel>Personal Information</SectionLabel>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <Input placeholder="Hermas" value={profile.firstName} onChange={set("firstName")} />
              </Field>
              <Field label="Last Name">
                <Input placeholder="Francisco" value={profile.lastName} onChange={set("lastName")} />
              </Field>
            </div>

            <Field label="Email">
              <Input type="email" placeholder="you@example.com" value={profile.email} onChange={set("email")} />
            </Field>

            <Field label="Job Title">
              <Input placeholder="e.g. Full-Stack Developer · Paris" value={profile.title} onChange={set("title")} />
            </Field>

            <Field label="Bio">
              <Textarea
                placeholder="Tell us about your experience, key skills, and career goals..."
                value={profile.bio}
                onChange={set("bio")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <Input placeholder="City, Country" value={profile.location} onChange={set("location")} />
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
                  ✓ Changes saved
                </motion.span>
              )}
            </AnimatePresence>
            <button
              className="btn-ghost text-sm"
              onClick={() => setProfile(MOCK_PROFILE)}
            >
              Cancel
            </button>
            <button className="btn-primary text-sm px-6 py-2.5" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
