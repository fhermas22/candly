/**
 * Landing page for Candly.
 * Hero, Job Feed, Features, CTA. Uses Framer Motion.
 */

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link, useLocation } from "react-router";

import {
  ROUTES,
  AUTH_MODE,
  authPath,
  homeWithHash,
  LANDING_ANCHOR,
} from "../../routes/paths";

// ─── Icons (SVG, pro, sans emojis) ────────────────────────────────────────────
function Icon({ name, className = "w-6 h-6", title }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : "presentation",
  };

  const pathsByName = {
    user: (
      <>
        <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    ),
    search: (
      <>
        <path
          d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    bolt: (
      <path
        d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    check: (
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    shield: (
      <path
        d="M12 2 20 6v6c0 5-3.2 9.4-8 10-4.8-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
    document: (
      <>
        <path
          d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 15v-5M12 15V7M16 15v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 6v12M17 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 10h6M11 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    globe: (
      <>
        <path
          d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M12 2c3 3 4.5 6.5 4.5 10S15 19 12 22c-3-3-4.5-6.5-4.5-10S9 5 12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    ),
  };

  const body = pathsByName[name];
  if (!body) return null;

  return (
    <svg {...common}>
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: 1,
    title: "Développeur Full-Stack Laravel",
    company: "SoftFusion",
    location: "Paris, France",
    mode: "Remote · Partiel",
    salary: "45 000 – 58 000 €",
    tags: ["Laravel 12", "React", "PostgreSQL", "CDI"],
    badge: "new",
    logoColor: "#22D3EE",
    logoBg: "rgba(34,211,238,0.12)",
    initials: "SF",
  },
  {
    id: 2,
    title: "Designer UI/UX Senior",
    company: "Axelio Studio",
    location: "Lyon, France",
    mode: "Présentiel",
    salary: "48 000 – 62 000 €",
    tags: ["Figma", "Design System", "Prototyping", "CDI"],
    badge: "hot",
    logoColor: "#10B981",
    logoBg: "rgba(16,185,129,0.12)",
    initials: "AX",
  },
  {
    id: 3,
    title: "DevOps Engineer – AWS & CI/CD",
    company: "Nexora Cloud",
    location: "Bordeaux",
    mode: "Full Remote",
    salary: "600 – 750 €/j",
    tags: ["AWS", "Docker", "Terraform", "Freelance"],
    badge: "new",
    logoColor: "#F59E0B",
    logoBg: "rgba(245,158,11,0.12)",
    initials: "NX",
  },
];

const MOCK_STEPS = [
  { num: "01", icon: "user", title: "Créez votre profil", desc: "Renseignez vos informations, téléchargez votre photo et votre CV en quelques secondes." },
  { num: "02", icon: "search", title: "Explorez les offres", desc: "Parcourez les annonces filtrées selon vos compétences, localisation et ambitions." },
  { num: "03", icon: "bolt", title: "Postulez en 1 clic", desc: "Envoyez votre candidature instantanément et suivez son évolution depuis votre tableau de bord." },
  { num: "04", icon: "check", title: "Recevez une réponse", desc: "L'administrateur examine votre profil et vous notifie directement de la décision finale." },
];

const MOCK_FEATURES = [
  { icon: "shield", iconBg: "rgba(34,211,238,0.1)", iconBorder: "rgba(34,211,238,0.2)", title: "Sécurité renforcée", desc: "Authentification JWT/Sanctum avec redirection intelligente selon votre rôle." },
  { icon: "document", iconBg: "rgba(16,185,129,0.1)", iconBorder: "rgba(16,185,129,0.2)", title: "Gestion de profil complète", desc: "Upload de photo optimisé, CV PDF jusqu'à 5 Mo, et bio personnalisée." },
  { icon: "chart", iconBg: "rgba(245,158,11,0.1)", iconBorder: "rgba(245,158,11,0.2)", title: "Suivi en temps réel", desc: "Tableaux de bord avec badges de statut colorés — Pending, Accepted, Rejected." },
  { icon: "bolt", iconBg: "rgba(244,63,94,0.1)", iconBorder: "rgba(244,63,94,0.2)", title: "Performance optimisée", desc: "Mise en cache des annonces, skeleton loaders et animations Framer Motion fluides." },
  { icon: "sliders", iconBg: "rgba(34,211,238,0.1)", iconBorder: "rgba(34,211,238,0.15)", title: "Panneau Admin puissant", desc: "Gestion CRUD des offres, modération des comptes et revue des candidatures." },
  { icon: "globe", iconBg: "rgba(16,185,129,0.1)", iconBorder: "rgba(16,185,129,0.15)", title: "Design \"Aura Tech\"", desc: "Dark mode premium, Glassmorphism, néons Cyan et esthétique haut de gamme." },
];

const POPULAR_TAGS = ["React", "Laravel", "UI/UX Design", "DevOps", "Product Manager", "Data Science"];

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated section wrapper — triggers when it enters viewport */
function AnimatedSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      style={{ transitionDelay: `${delay}s` }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Candly logo wordmark */
function Logo() {
  return (
    <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
      <div
        className="relative w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#22D3EE,#0891b2)",
          boxShadow: "0 0 16px rgba(34,211,238,0.45)",
        }}
      >
        <span className="font-heading font-black text-sm" style={{ color: "var(--navy-900)" }}>
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
    </Link>
  );
}

/** Section label tag */
function SectionTag({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-px" style={{ background: "#22D3EE" }} />
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#22D3EE" }}
      >
        {children}
      </span>
    </div>
  );
}

/** Navigation bar */
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 h-16 glass-dark"
    >
      <div className="flex min-w-0 shrink-0 items-center">
        <Logo />
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <Link to={ROUTES.OFFRES} className="btn-ghost">Offres</Link>
        <Link to={homeWithHash(LANDING_ANCHOR.HOW_IT_WORKS)} className="btn-ghost">Comment ça marche</Link>
        <Link to={authPath(AUTH_MODE.LOGIN)} className="btn-ghost">Connexion</Link>
        <Link to={authPath(AUTH_MODE.REGISTER)} className="btn-primary">Créer un compte</Link>
      </div>

      <div className="md:hidden flex shrink-0 items-center">
        <button
          type="button"
          className="btn-ghost inline-flex h-10 w-10 items-center justify-center p-0"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className="absolute top-16 left-0 right-0 md:hidden px-4 py-4"
          style={{ background: "rgba(2, 6, 23, 0.92)", borderBottom: "1px solid rgba(34,211,238,0.08)" }}
        >
          <div className="flex flex-col gap-2">
            <Link to={ROUTES.OFFRES} onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">Offres</Link>
            <Link to={homeWithHash(LANDING_ANCHOR.HOW_IT_WORKS)} onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">Comment ça marche</Link>
            <Link to={authPath(AUTH_MODE.LOGIN)} onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">Connexion</Link>
            <Link to={authPath(AUTH_MODE.REGISTER)} onClick={() => setOpen(false)} className="btn-primary w-full justify-center">Créer un compte</Link>
          </div>
        </div>
      ) : null}
    </motion.nav>
  );
}

/** Hero section with search */
function HeroSection() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section
      className="relative min-h-svh flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-10 pt-24 pb-20 overflow-hidden"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(34,211,238,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 0%, transparent 72%)",
        }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
        style={{
          background: "rgba(34,211,238,0.08)",
          border: "1px solid rgba(34,211,238,0.2)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: "#22D3EE", boxShadow: "0 0 8px rgba(34,211,238,0.9)" }}
        />
        <span className="text-xs font-medium" style={{ color: "#22D3EE" }}>
          Plateforme de recrutement premium · Aura Tech
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-heading text-[clamp(2.1rem,7vw,4.2rem)] font-black leading-[1.08] tracking-tight mb-6 max-w-3xl"
        style={{ color: "var(--text-primary)" }}
      >
        Votre prochaine opportunité{" "}
        <span
          style={{
            background: "linear-gradient(135deg,#22D3EE 0%,#67e8f9 50%,#10B981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          vous attend ici
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[clamp(0.98rem,2.2vw,1.15rem)] max-w-lg mb-8 sm:mb-11 leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Candly connecte les meilleurs talents aux entreprises qui comptent. Déposez votre profil, postulez en un clic, suivez chaque étape en temps réel.
      </motion.p>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,22,40,0.8)",
          border: "1px solid rgba(34,211,238,0.15)",
          backdropFilter: "blur(12px)",
          padding: "6px 6px 6px 20px",
        }}
      >
        {/* Search icon */}
        <svg
          className="w-4 h-4 shrink-0 mr-3"
          width={16}
          height={16}
          style={{ color: "#64748b" }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titre du poste, compétence…"
          className="flex-1 bg-transparent border-none outline-none text-sm"
          style={{ color: "#f1f5f9" }}
        />

        {/* Divider */}
        <div className="w-px h-7 mx-2 shrink-0" style={{ background: "rgba(34,211,238,0.1)" }} />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localisation"
          className="bg-transparent border-none outline-none text-sm"
          style={{ color: "#f1f5f9", maxWidth: "140px" }}
        />

        <Link
          to={ROUTES.OFFRES}
          className="btn-primary ml-2 shrink-0 whitespace-nowrap inline-flex items-center justify-center"
        >
          Rechercher
        </Link>
      </motion.div>

      {/* Popular tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="flex flex-wrap justify-center items-center gap-2 mt-4"
      >
        <span className="text-xs mr-1" style={{ color: "#475569" }}>Populaire :</span>
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag}
            to={ROUTES.OFFRES}
            className="px-3 py-1 rounded-full text-xs transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#64748b",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#22D3EE";
              e.currentTarget.style.borderColor = "rgba(34,211,238,0.25)";
              e.currentTarget.style.background = "rgba(34,211,238,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            {tag}
          </Link>
        ))}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex items-center gap-10 mt-16 px-10 py-6 rounded-2xl"
        style={{
          background: "rgba(10,22,40,0.55)",
          border: "1px solid rgba(34,211,238,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        {[
          { num: "1 200+", label: "Offres actives" },
          { num: "8 400", label: "Candidats inscrits" },
          { num: "320", label: "Entreprises partenaires" },
          { num: "94%", label: "Taux de satisfaction" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-10">
            {i > 0 && <div className="w-px h-10" style={{ background: "rgba(34,211,238,0.12)" }} />}
            <div className="text-center">
              <div
                className="font-heading text-3xl font-black leading-tight"
                style={{
                  background: "linear-gradient(135deg,#22D3EE,#67e8f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.num}
              </div>
              <div className="text-sm mt-1.5 font-medium tracking-wide" style={{ color: "#94a3b8" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/** Job card component */
function JobCard({ job, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="glass-card flex flex-col p-6 cursor-pointer"
    >
      {/* Card top */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-heading font-black text-sm shrink-0"
          style={{ background: job.logoBg, color: job.logoColor, border: `1px solid ${job.logoColor}20` }}
        >
          {job.initials}
        </div>
        {job.badge === "new" ? (
          <span className="badge shrink-0" style={{ background: "rgba(34,211,238,0.12)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.25)", fontSize: "11px" }}>
            Nouveau
          </span>
        ) : (
          <span className="badge shrink-0" style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.25)", fontSize: "11px" }}>
            Urgent
          </span>
        )}
      </div>

      <h3 className="font-heading font-bold text-base mb-1" style={{ color: "#f1f5f9" }}>
        {job.title}
      </h3>
      <p className="text-sm mb-4 leading-snug" style={{ color: "#94a3b8" }}>
        {job.company} · {job.location}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {job.tags.map((t) => (
          <span
            key={t}
            className="text-xs px-3 py-1.5 rounded-md leading-tight"
            style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between gap-4 pt-4"
        style={{ borderTop: "1px solid rgba(34,211,238,0.12)" }}
      >
        <div className="min-w-0">
          <div className="font-heading font-bold text-sm sm:text-base" style={{ color: "#10B981" }}>{job.salary}</div>
          <div className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
            <svg className="w-3.5 h-3.5 shrink-0" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{job.mode}</span>
          </div>
        </div>
        <Link
          to={authPath(AUTH_MODE.REGISTER)}
          className="btn-secondary text-sm px-4 py-2.5 shrink-0 font-semibold inline-flex items-center justify-center"
        >
          Postuler →
        </Link>
      </div>
    </motion.div>
  );
}

/** Latest jobs section */
function JobsSection() {
  return (
    <section className="px-[5%] py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-11">
        <AnimatedSection>
          <SectionTag>Opportunités récentes</SectionTag>
          <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-black tracking-tight" style={{ color: "#f1f5f9" }}>
            Dernières offres publiées
          </h2>
        </AnimatedSection>
        <AnimatedSection className="shrink-0">
          <Link
            to={ROUTES.OFFRES}
            className="btn-ghost inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
            style={{ color: "#22D3EE" }}
          >
            Voir toutes les offres
            <svg className="w-4 h-4 shrink-0" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </AnimatedSection>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {MOCK_JOBS.map((job, i) => (
          <JobCard key={job.id} job={job} index={i} />
        ))}
      </div>
    </section>
  );
}

/** How it works section */
function HowItWorksSection() {
  return (
    <section
      id={LANDING_ANCHOR.HOW_IT_WORKS}
      className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 scroll-mt-24"
      style={{
        background: "rgba(10,22,40,0.4)",
        borderTop: "1px solid rgba(34,211,238,0.07)",
        borderBottom: "1px solid rgba(34,211,238,0.07)",
      }}
    >
      <AnimatedSection className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
        <SectionTag>Processus simplifié</SectionTag>
        <h2 className="font-heading text-[clamp(1.7rem,4.5vw,2.5rem)] font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
          Postuler n'a jamais été aussi simple
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
          Trois étapes suffisent pour décrocher votre prochaine opportunité.
        </p>
      </AnimatedSection>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {MOCK_STEPS.map((step) => (
          <motion.div
            key={step.num}
            variants={fadeUp}
            className="relative p-8 rounded-2xl"
            style={{
              background: "rgba(15,32,64,0.5)",
              border: "1px solid rgba(34,211,238,0.08)",
            }}
            whileHover={{
              borderColor: "rgba(34,211,238,0.2)",
              boxShadow: "0 0 24px rgba(34,211,238,0.06)",
            }}
          >
            {/* Background number */}
            <span
              className="absolute top-4 right-5 font-heading text-5xl font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg,rgba(34,211,238,0.14),rgba(34,211,238,0.03))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {step.num}
            </span>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{
                background: "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.2)",
                boxShadow: "0 0 16px rgba(34,211,238,0.12)",
              }}
            >
              <Icon name={step.icon} className="w-6 h-6" title={step.title} />
            </div>
            <h3 className="font-heading font-bold text-base mb-2.5" style={{ color: "#f1f5f9" }}>
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {step.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/** Features section */
function FeaturesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <AnimatedSection className="max-w-lg mb-14">
        <SectionTag>Pourquoi Candly</SectionTag>
        <h2 className="font-heading text-[clamp(1.7rem,4.5vw,2.5rem)] font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
          Une expérience premium,<br />de A à Z
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Tout ce dont vous avez besoin pour gérer votre carrière avec élégance et efficacité.
        </p>
      </AnimatedSection>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {MOCK_FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            className="p-7 rounded-2xl"
            style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(34,211,238,0.08)" }}
            whileHover={{ borderColor: "rgba(34,211,238,0.2)", y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
              style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}` }}
            >
              <Icon name={f.icon} className="w-6 h-6" title={f.title} />
            </div>
            <h3 className="font-heading font-bold text-sm mb-2" style={{ color: "#f1f5f9" }}>
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/** CTA section */
function CTASection() {
  return (
    <section className="px-[5%] py-24 text-center">
      <AnimatedSection>
        <motion.div
          className="relative max-w-2xl mx-auto px-12 py-16 rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10,22,40,0.7)",
            border: "1px solid rgba(34,211,238,0.15)",
            boxShadow: "0 0 80px rgba(34,211,238,0.06)",
          }}
          whileHover={{ boxShadow: "0 0 100px rgba(34,211,238,0.1)" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse,rgba(34,211,238,0.1) 0%,transparent 70%)" }}
          />

          <SectionTag>Rejoignez Candly</SectionTag>
          <h2 className="font-heading text-[clamp(1.8rem,3.5vw,2.4rem)] font-black tracking-tight mb-4" style={{ color: "#f1f5f9" }}>
            Prêt à booster<br />votre carrière ?
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: "#94a3b8" }}>
            Créez votre profil gratuitement et accédez aux meilleures opportunités du marché dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={authPath(AUTH_MODE.REGISTER)} className="btn-primary px-7 py-3 text-sm inline-flex items-center justify-center">
              Créer mon profil gratuitement
            </Link>
            <Link to={ROUTES.OFFRES} className="btn-secondary px-7 py-3 text-sm inline-flex items-center justify-center">
              Parcourir les offres
            </Link>
          </div>
        </motion.div>
      </AnimatedSection>
    </section>
  );
}

/** Blocs légaux (cibles des liens pied de page et page d’inscription) */
function LegalSection() {
  return (
    <section
      className="px-[5%] py-14"
      style={{
        borderTop: "1px solid rgba(34,211,238,0.07)",
        background: "rgba(2,6,23,0.45)",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-10">
        <div id={LANDING_ANCHOR.LEGAL} className="scroll-mt-24">
          <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#f1f5f9" }}>
            Mentions légales
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Candly est un service de démonstration. Les informations sur l&apos;éditeur, l&apos;hébergeur et la propriété
            intellectuelle seront complétées avant toute mise en production.
          </p>
        </div>
        <div id={LANDING_ANCHOR.PRIVACY} className="scroll-mt-24">
          <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#f1f5f9" }}>
            Politique de confidentialité
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Les données saisies sur Candly servent uniquement au fonctionnement du prototype. Pour toute question,
            utilisez le lien Contact ci-dessous.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Footer */
function Footer() {
  return (
    <footer
      className="flex justify-between items-center flex-wrap gap-4 px-[5%] py-10"
      style={{ borderTop: "1px solid rgba(34,211,238,0.07)" }}
    >
      <Logo />
      <div className="flex flex-wrap gap-5">
        <Link to={homeWithHash(LANDING_ANCHOR.LEGAL)} className="btn-ghost text-xs p-0" style={{ color: "#475569" }}>
          Mentions légales
        </Link>
        <Link to={homeWithHash(LANDING_ANCHOR.PRIVACY)} className="btn-ghost text-xs p-0" style={{ color: "#475569" }}>
          Confidentialité
        </Link>
        <a href="mailto:contact@candly.io" className="btn-ghost text-xs p-0" style={{ color: "#475569" }}>
          Contact
        </a>
      </div>
      <p className="text-xs" style={{ color: "#475569" }}>
        © 2026 Candly · Tous droits réservés
      </p>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Landing() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash?.replace(/^#/, "");
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <JobsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
      <LegalSection />
      <Footer />
    </div>
  );
}
