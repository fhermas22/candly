/**
 * Auth page for Candly.
 * Login & Register with split layout.
 */

import { useState, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router";

import {
  ROUTES,
  AUTH_MODE,
  homeWithHash,
  LANDING_ANCHOR,
} from "../../routes/paths";

// ─── Animation Variants ───────────────────────────────────────────────────────
const formVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CandlyLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg,#22D3EE,#0891b2)",
          boxShadow: "0 0 16px rgba(34,211,238,0.45)",
        }}
      >
        <span className="font-heading font-black text-sm leading-none" style={{ color: "var(--navy-900)" }}>
          C
        </span>
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.8)" }}
        />
      </div>
      <span className="font-heading font-bold text-lg" style={{ color: "#f1f5f9" }}>
        Cand<span style={{ color: "#22D3EE" }}>ly</span>
      </span>
    </div>
  );
}

/** Reusable labelled input field */
function Field({ label, type = "text", placeholder, value, onChange, autoComplete }) {
  const uid = useId();
  const id = `${uid}-${type}`;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="input-aura"
      />
    </div>
  );
}

/** Google OAuth button */
function GoogleButton() {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        background: "rgba(15,32,64,0.4)",
        border: "1px solid rgba(34,211,238,0.15)",
        color: "#e2e8f0",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(34,211,238,0.08)";
        e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(15,32,64,0.4)";
        e.currentTarget.style.borderColor = "rgba(34,211,238,0.15)";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continuer avec Google
    </button>
  );
}

/** Divider with label */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
      <span className="text-xs shrink-0" style={{ color: "#475569" }}>ou continuer avec</span>
      <div className="flex-1 h-px" style={{ background: "rgba(34,211,238,0.1)" }} />
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /api/auth/login { email, password }
    console.log("[Candly] Login →", { email });
  };

  return (
    <motion.div
      key="login"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2
        className="font-heading font-black text-2xl mb-1.5 tracking-tight"
        style={{ color: "#f1f5f9" }}
      >
        Bon retour
      </h2>
      <p className="text-sm mb-7" style={{ color: "#64748b" }}>
        Connectez-vous pour accéder à votre tableau de bord
      </p>

      <form onSubmit={handleSubmit}>
        <Field
          label="Adresse e-mail"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Field
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="text-right mb-6 -mt-1">
          <a
            href="mailto:contact@candly.io?subject=Candly%20%E2%80%94%20R%C3%A9initialisation%20du%20mot%20de%20passe"
            className="text-xs transition-opacity hover:opacity-100 inline-block"
            style={{ color: "#22D3EE", opacity: 0.8 }}
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3 text-sm mb-5">
          Se connecter
        </button>
      </form>

      <OrDivider />
      <GoogleButton />

      <p className="text-center text-xs mt-5" style={{ color: "#475569" }}>
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="transition-opacity hover:opacity-100"
          style={{ color: "#22D3EE", opacity: 0.85 }}
        >
          Inscrivez-vous gratuitement
        </button>
      </p>
    </motion.div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "",
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /api/auth/register
    console.log("[Candly] Register →", { ...form, password: "***" });
  };

  return (
    <motion.div
      key="register"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <h2
        className="font-heading font-black text-2xl mb-1.5 tracking-tight"
        style={{ color: "#f1f5f9" }}
      >
        Créer un compte
      </h2>
      <p className="text-sm mb-7" style={{ color: "#64748b" }}>
        Rejoignez Candly et trouvez votre prochaine opportunité
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" placeholder="Hermas" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
          <Field label="Nom" placeholder="Francisco" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
        </div>
        <Field label="Adresse e-mail" type="email" placeholder="vous@exemple.com" value={form.email} onChange={set("email")} autoComplete="email" />
        <Field label="Mot de passe" type="password" placeholder="8 caractères minimum" value={form.password} onChange={set("password")} autoComplete="new-password" />
        <Field label="Confirmer le mot de passe" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />

        <button type="submit" className="btn-primary w-full justify-center py-3 text-sm mt-2">
          Créer mon compte
        </button>
      </form>

      <p className="text-center text-xs mt-5 leading-relaxed" style={{ color: "#475569" }}>
        En vous inscrivant, vous acceptez nos{" "}
        <Link
          to={homeWithHash(LANDING_ANCHOR.LEGAL)}
          className="underline-offset-2 hover:underline"
          style={{ color: "#22D3EE" }}
        >
          Conditions d&apos;utilisation
        </Link>{" "}
        et notre{" "}
        <Link
          to={homeWithHash(LANDING_ANCHOR.PRIVACY)}
          className="underline-offset-2 hover:underline"
          style={{ color: "#22D3EE" }}
        >
          Politique de confidentialité
        </Link>
      </p>

      <p className="text-center text-xs mt-3" style={{ color: "#475569" }}>
        Déjà inscrit ?{" "}
        <button
          type="button"
          onClick={onSwitch}
          style={{ color: "#22D3EE", opacity: 0.85 }}
          className="hover:opacity-100 transition-opacity"
        >
          Se connecter
        </button>
      </p>
    </motion.div>
  );
}

// ─── Left Branding Panel ──────────────────────────────────────────────────────
function BrandingPanel() {
  return (
    <div className="hidden lg:flex flex-1 flex-col justify-center px-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.035) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(34,211,238,0.035) 1px,transparent 1px)",
          backgroundSize: "55px 55px",
          maskImage: "radial-gradient(ellipse 80% 80% at 40% 50%,black 10%,transparent 80%)",
        }}
      />

      <Link to={ROUTES.HOME} className="relative z-1 mb-14 inline-block">
        <CandlyLogo />
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-heading font-black leading-tight tracking-tight mb-5 relative z-1"
        style={{ fontSize: "clamp(2rem,3.5vw,3rem)", color: "#f1f5f9" }}
      >
        Votre talent<br />mérite d&apos;être{" "}
        <span
          style={{
            background: "linear-gradient(135deg,#22D3EE,#10B981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          remarqué
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-sm leading-relaxed mb-12 max-w-sm relative z-1"
        style={{ color: "#94a3b8" }}
      >
        Rejoignez des milliers de candidats qui ont trouvé leur prochaine opportunité via Candly. Sécurisé, rapide, premium.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-5 max-w-sm relative z-1"
      >
        <p className="text-sm leading-relaxed mb-4 italic" style={{ color: "#e2e8f0" }}>
          &ldquo;En moins de deux semaines sur Candly, j&apos;ai décroché un entretien dans une scale-up parisienne. L&apos;interface est vraiment intuitive.&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0"
            style={{
              background: "rgba(34,211,238,0.15)",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#22D3EE",
            }}
          >
            AS
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Amina Sorel</p>
            <p className="text-xs" style={{ color: "#64748b" }}>Développeuse React · Paris</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeFromUrl = searchParams.get("mode");
  const activeTab =
    modeFromUrl === AUTH_MODE.REGISTER ? "register" : "login";

  const setAuthTab = useCallback(
    (tab) => {
      setSearchParams(
        { mode: tab === "register" ? AUTH_MODE.REGISTER : AUTH_MODE.LOGIN },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const tabs = [
    { id: "login", label: "Connexion" },
    { id: "register", label: "Créer un compte" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "#020617",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% -5%,rgba(34,211,238,0.12) 0%,transparent 65%)," +
          "radial-gradient(ellipse at 15% 60%,rgba(34,211,238,0.06) 0%,transparent 40%)",
      }}
    >
      <BrandingPanel />

      <div
        className="w-full lg:w-120 flex flex-col justify-center px-8 sm:px-14 py-12"
        style={{
          background: "rgba(10,22,40,0.7)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(34,211,238,0.1)",
        }}
      >
        <div className="lg:hidden mb-10">
          <Link to={ROUTES.HOME} className="inline-block">
            <CandlyLogo />
          </Link>
        </div>

        <div
          className="flex gap-1 p-1 rounded-xl mb-8"
          style={{
            background: "rgba(15,32,64,0.6)",
            border: "1px solid rgba(34,211,238,0.08)",
          }}
          role="tablist"
          aria-label="Mode d&apos;authentification"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setAuthTab(tab.id)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                color: activeTab === tab.id ? "#22D3EE" : "#64748b",
                background: activeTab === tab.id ? "rgba(34,211,238,0.12)" : "transparent",
                boxShadow: activeTab === tab.id ? "0 0 12px rgba(34,211,238,0.1)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <LoginForm key="login" onSwitch={() => setAuthTab("register")} />
          ) : (
            <RegisterForm key="register" onSwitch={() => setAuthTab("login")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
