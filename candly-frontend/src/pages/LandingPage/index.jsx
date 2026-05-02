/**
 * LandingPage
 * Candly – Public landing page with Hero, Job Feed, How It Works,
 * Features, and CTA sections. Uses Framer Motion for all animations.
 *
 * Mock data is localized in /src/data/mockJobs.js
 * Replace router links with React Router <Link> tags when wiring up.
 */

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

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
  { num: "01", icon: "👤", title: "Créez votre profil", desc: "Renseignez vos informations, téléchargez votre photo et votre CV en quelques secondes." },
  { num: "02", icon: "🔍", title: "Explorez les offres", desc: "Parcourez les annonces filtrées selon vos compétences, localisation et ambitions." },
  { num: "03", icon: "⚡", title: "Postulez en 1 clic", desc: "Envoyez votre candidature instantanément et suivez son évolution depuis votre tableau de bord." },
  { num: "04", icon: "✅", title: "Recevez une réponse", desc: "L'administrateur examine votre profil et vous notifie directement de la décision finale." },
];

const MOCK_FEATURES = [
  { icon: "🛡️", iconBg: "rgba(34,211,238,0.1)", iconBorder: "rgba(34,211,238,0.2)", title: "Sécurité renforcée", desc: "Authentification JWT/Sanctum avec redirection intelligente selon votre rôle." },
  { icon: "📄", iconBg: "rgba(16,185,129,0.1)", iconBorder: "rgba(16,185,129,0.2)", title: "Gestion de profil complète", desc: "Upload de photo optimisé, CV PDF jusqu'à 5 Mo, et bio personnalisée." },
  { icon: "📊", iconBg: "rgba(245,158,11,0.1)", iconBorder: "rgba(245,158,11,0.2)", title: "Suivi en temps réel", desc: "Tableaux de bord avec badges de statut colorés — Pending, Accepted, Rejected." },
  { icon: "⚡", iconBg: "rgba(244,63,94,0.1)", iconBorder: "rgba(244,63,94,0.2)", title: "Performance optimisée", desc: "Mise en cache des annonces, skeleton loaders et animations Framer Motion fluides." },
  { icon: "🎛️", iconBg: "rgba(34,211,238,0.1)", iconBorder: "rgba(34,211,238,0.15)", title: "Panneau Admin puissant", desc: "Gestion CRUD des offres, modération des comptes et revue des candidatures." },
  { icon: "🌐", iconBg: "rgba(16,185,129,0.1)", iconBorder: "rgba(16,185,129,0.15)", title: "Design \"Aura Tech\"", desc: "Dark mode premium, Glassmorphism, néons Cyan et esthétique haut de gamme." },
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
    <div className="flex items-center gap-2.5">
      <div
        className="relative w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#22D3EE,#0891b2)",
          boxShadow: "0 0 16px rgba(34,211,238,0.45)",
        }}
      >
        <span className="font-heading font-black text-navy-900 text-sm">C</span>
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
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-16 glass-dark"
    >
      <Logo />
      <div className="flex items-center gap-2">
        <button className="btn-ghost hidden sm:flex">Offres</button>
        <button className="btn-ghost hidden sm:flex">Comment ça marche</button>
        <button className="btn-ghost">Connexion</button>
        <button className="btn-primary">Créer un compte</button>
      </div>
    </motion.nav>
  );
}

/** Hero section with search */
function HeroSection() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-[5%] pt-24 pb-20 overflow-hidden"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(34,211,238,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 80%)",
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
        className="font-heading text-[clamp(2.4rem,5.5vw,4.2rem)] font-black leading-[1.08] tracking-tight mb-6 max-w-3xl"
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
        className="text-[clamp(1rem,1.8vw,1.15rem)] max-w-lg mb-11 leading-relaxed"
        style={{ color: "#94a3b8" }}
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
          className="w-4 h-4 flex-shrink-0 mr-3"
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
        <div className="w-px h-7 mx-2 flex-shrink-0" style={{ background: "rgba(34,211,238,0.1)" }} />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localisation"
          className="bg-transparent border-none outline-none text-sm"
          style={{ color: "#f1f5f9", maxWidth: "140px" }}
        />

        <button className="btn-primary ml-2 flex-shrink-0 whitespace-nowrap">
          Rechercher
        </button>
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
          <button
            key={tag}
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
          </button>
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
              <div className="text-xs mt-1 font-medium tracking-wide" style={{ color: "#64748b" }}>
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
      className="glass-card p-6 cursor-pointer"
    >
      {/* Card top */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-heading font-black text-sm flex-shrink-0"
          style={{ background: job.logoBg, color: job.logoColor, border: `1px solid ${job.logoColor}20` }}
        >
          {job.initials}
        </div>
        {job.badge === "new" ? (
          <span className="badge" style={{ background: "rgba(34,211,238,0.12)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.25)", fontSize: "10px" }}>
            Nouveau
          </span>
        ) : (
          <span className="badge" style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.25)", fontSize: "10px" }}>
            🔥 Urgent
          </span>
        )}
      </div>

      <h3 className="font-heading font-bold text-base mb-1" style={{ color: "#f1f5f9" }}>
        {job.title}
      </h3>
      <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
        {job.company} · {job.location}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {job.tags.map((t) => (
          <span
            key={t}
            className="text-xs px-2.5 py-1 rounded-md"
            style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <div className="font-heading font-bold text-sm" style={{ color: "#10B981" }}>{job.salary}</div>
          <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#64748b" }}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.mode}
          </div>
        </div>
        <button className="btn-secondary text-xs px-4 py-2">Postuler →</button>
      </div>
    </motion.div>
  );
}

/** Latest jobs section */
function JobsSection() {
  return (
    <section className="px-[5%] py-20">
      <div className="flex justify-between items-end mb-11">
        <AnimatedSection>
          <SectionTag>Opportunités récentes</SectionTag>
          <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-black tracking-tight" style={{ color: "#f1f5f9" }}>
            Dernières offres publiées
          </h2>
        </AnimatedSection>
        <AnimatedSection>
          <button className="btn-ghost flex items-center gap-2 text-sm font-semibold" style={{ color: "#22D3EE" }}>
            Voir toutes les offres
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
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
      className="px-[5%] py-24"
      style={{
        background: "rgba(10,22,40,0.4)",
        borderTop: "1px solid rgba(34,211,238,0.07)",
        borderBottom: "1px solid rgba(34,211,238,0.07)",
      }}
    >
      <AnimatedSection className="text-center max-w-xl mx-auto mb-16">
        <SectionTag>Processus simplifié</SectionTag>
        <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-black tracking-tight mb-4" style={{ color: "#f1f5f9" }}>
          Postuler n'a jamais été aussi simple
        </h2>
        <p className="text-base" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
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
              {step.icon}
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
    <section className="px-[5%] py-24">
      <AnimatedSection className="max-w-lg mb-14">
        <SectionTag>Pourquoi Candly</SectionTag>
        <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-black tracking-tight mb-4" style={{ color: "#f1f5f9" }}>
          Une expérience premium,<br />de A à Z
        </h2>
        <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>
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
              {f.icon}
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
            <button className="btn-primary px-7 py-3 text-sm">
              Créer mon profil gratuitement
            </button>
            <button className="btn-secondary px-7 py-3 text-sm">
              Parcourir les offres
            </button>
          </div>
        </motion.div>
      </AnimatedSection>
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
      <div className="flex gap-5">
        {["Mentions légales", "Confidentialité", "Contact"].map((l) => (
          <button key={l} className="btn-ghost text-xs p-0" style={{ color: "#475569" }}>
            {l}
          </button>
        ))}
      </div>
      <p className="text-xs" style={{ color: "#475569" }}>
        © 2025 Candly · Tous droits réservés
      </p>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <JobsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
