/**
 * MainLayout
 * Candly – Primary layout shell: Navbar (top) + Sidebar (left) + Page content.
 * Wraps all authenticated pages. Public pages (Landing, Auth) bypass this layout.
 *
 * Usage:
 *   <MainLayout userRole="candidate">
 *     <YourPage />
 *   </MainLayout>
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock auth context (replace with real context when API is ready) ──────────
const MOCK_USER = {
  name: "Hermas Francisco",
  email: "hermas@candly.io",
  role: "candidate", // "candidate" | "admin"
  avatarInitials: "HF",
  avatarColor: "#22D3EE",
};

// ─── Navigation definitions ───────────────────────────────────────────────────
const CANDIDATE_NAV = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "jobs",
    label: "Rechercher des offres",
    href: "/offres",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "applications",
    label: "Mes candidatures",
    href: "/candidatures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Mon profil",
    href: "/profil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ADMIN_NAV = [
  {
    id: "dashboard",
    label: "Supervision",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "jobs-admin",
    label: "Gestion des offres",
    href: "/admin/offres",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" strokeLinecap="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Gestion des candidats",
    href: "/admin/candidats",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "applications-admin",
    label: "Revue des candidatures",
    href: "/admin/candidatures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────
const sidebarVariants = {
  open:   { x: 0,      opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  closed: { x: -280,  opacity: 0, transition: { duration: 0.25, ease: [0.55, 0, 0.1, 1] } },
};

const overlayVariants = {
  open:   { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
};

const navItemVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06 + 0.1, duration: 0.35, ease: "easeOut" },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Candly wordmark logo */
function CandlyLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)",
            boxShadow: "0 0 14px rgba(34, 211, 238, 0.45)",
          }}
        >
          <span className="font-heading font-black text-sm leading-none" style={{ color: "var(--navy-900)" }}>
            C
          </span>
        </div>
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: "#10B981", boxShadow: "0 0 6px rgba(16, 185, 129, 0.7)" }}
        />
      </div>
      {!compact && (
        <span
          className="font-heading font-bold text-lg tracking-tight"
          style={{ color: "#f1f5f9" }}
        >
          Cand<span style={{ color: "#22D3EE" }}>ly</span>
        </span>
      )}
    </div>
  );
}

/** Single sidebar navigation item */
function NavItem({ item, isActive, index, onNavigate }) {
  return (
    <motion.div
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
    >
      <button
        type="button"
        onClick={() => onNavigate(item.href)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
        style={{
          color: isActive ? "#22D3EE" : "#94a3b8",
          background: isActive
            ? "rgba(34, 211, 238, 0.08)"
            : "transparent",
          border: isActive
            ? "1px solid rgba(34, 211, 238, 0.18)"
            : "1px solid transparent",
          boxShadow: isActive ? "0 0 12px rgba(34, 211, 238, 0.08)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = "#f1f5f9";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
            style={{ background: "#22D3EE", boxShadow: "0 0 8px rgba(34, 211, 238, 0.8)" }}
          />
        )}
        <span className="ml-1">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    </motion.div>
  );
}

/** User avatar badge */
function UserAvatar({ user, size = "md" }) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-heading font-bold shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${user.avatarColor}33 0%, ${user.avatarColor}55 100%)`,
        border: `1.5px solid ${user.avatarColor}55`,
        color: user.avatarColor,
        boxShadow: `0 0 10px ${user.avatarColor}25`,
      }}
    >
      {user.avatarInitials}
    </div>
  );
}

/** Top Navbar component */
function Navbar({ user, onMenuToggle, isSidebarOpen, breadcrumbLabel = "Tableau de bord" }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const roleBadge = user.role === "admin"
    ? { label: "Admin", color: "#10B981" }
    : { label: "Candidat", color: "#22D3EE" };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center px-4 gap-4"
      style={{
        background: "rgba(2, 6, 23, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(34, 211, 238, 0.07)",
      }}
    >
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 45 : 0, y: isSidebarOpen ? 7 : 0 }}
            className="w-5 h-0.5 rounded-full"
            style={{ background: "#94a3b8" }}
          />
          <motion.div
            animate={{ opacity: isSidebarOpen ? 0 : 1 }}
            className="w-5 h-0.5 rounded-full"
            style={{ background: "#94a3b8" }}
          />
          <motion.div
            animate={{ rotate: isSidebarOpen ? -45 : 0, y: isSidebarOpen ? -7 : 0 }}
            className="w-5 h-0.5 rounded-full"
            style={{ background: "#94a3b8" }}
          />
        </button>

        <div className="lg:hidden">
          <CandlyLogo />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-sm min-w-0" style={{ color: "#64748b" }}>
        <span>Candly</span>
        <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="truncate" style={{ color: "#f1f5f9" }}>{breadcrumbLabel}</span>
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "#94a3b8" }}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" width={20} height={20} aria-hidden>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
            </svg>
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "#22D3EE", boxShadow: "0 0 6px rgba(34, 211, 238, 0.8)" }}
            />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-12 w-80 glass-modal p-4 z-50"
              >
                <p className="font-heading text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>
                  Notifications
                </p>
                <div className="space-y-2">
                  {[
                    { msg: "Votre candidature a été examinée", time: "Il y a 2h", dot: "#22D3EE" },
                    { msg: "Nouvelle offre correspondant à votre profil", time: "Il y a 5h", dot: "#10B981" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                      <div>
                        <p className="text-sm" style={{ color: "#e2e8f0" }}>{n.msg}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: `${roleBadge.color}15`,
            color: roleBadge.color,
            border: `1px solid ${roleBadge.color}30`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: roleBadge.color, boxShadow: `0 0 5px ${roleBadge.color}` }}
          />
          {roleBadge.label}
        </div>

        <div className="flex items-center gap-2 ml-1">
          <UserAvatar user={user} size="sm" />
          <div className="hidden sm:block max-w-[120px]">
            <p className="text-xs font-medium leading-tight truncate" style={{ color: "#f1f5f9" }}>
              {user.name.split(" ")[0]}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
          style={{ color: "#64748b" }}
          aria-label="Paramètres"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" width={16} height={16} aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/** Left Sidebar component */
function Sidebar({ user, activeRoute, onNavigate }) {
  const navItems = user.role === "admin" ? ADMIN_NAV : CANDIDATE_NAV;

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-64 z-30 flex flex-col pt-16"
      style={{
        background: "rgba(1, 5, 17, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(34, 211, 238, 0.07)",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-5 mb-2">
        <CandlyLogo />
      </div>

      <div className="mx-4 mb-4">
        <hr className="divider-glow" />
      </div>

      <div className="px-5 mb-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "#475569" }}
        >
          {user.role === "admin" ? "Administration" : "Navigation"}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item, i) => (
          <NavItem
            key={item.id}
            item={item}
            index={i}
            isActive={activeRoute === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <hr className="divider-glow mb-3" />
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
          style={{ border: "1px solid rgba(34, 211, 238, 0.07)" }}
        >
          <UserAvatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: "#64748b" }}>
              {user.email}
            </p>
          </div>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors shrink-0"
            style={{ color: "#64748b" }}
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" width={16} height={16} aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

/**
 * @param {Object}  props
 * @param {React.ReactNode} props.children    - Page content
 * @param {string}  [props.userRole]          - "candidate" | "admin"
 * @param {string}  [props.activeRoute]       - Current route path for nav highlighting
 * @param {string}  [props.breadcrumbLabel]   - Fil d'Ariane (desktop navbar)
 * @param {(href: string) => void} [props.onNavigate] - Si fourni, la route affichée suit `activeRoute` (mode contrôlé)
 */
export default function MainLayout({
  children,
  userRole = "candidate",
  activeRoute = "/dashboard",
  breadcrumbLabel,
  onNavigate: onNavigateProp,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fallbackRoute, setFallbackRoute] = useState(activeRoute);

  const currentRoute = onNavigateProp ? activeRoute : fallbackRoute;

  const user = { ...MOCK_USER, role: userRole };

  const navItems = user.role === "admin" ? ADMIN_NAV : CANDIDATE_NAV;
  const resolvedBreadcrumb =
    breadcrumbLabel ??
    navItems.find((item) => item.href === currentRoute)?.label ??
    "Tableau de bord";

  const handleNavigate = (href) => {
    setMobileSidebarOpen(false);
    if (onNavigateProp) onNavigateProp(href);
    else {
      setFallbackRoute(href);
      console.log(`[Candly] Navigating to: ${href}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      <Navbar
        user={user}
        onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
        isSidebarOpen={mobileSidebarOpen}
        breadcrumbLabel={resolvedBreadcrumb}
      />

      <div className="hidden lg:block">
        <Sidebar
          user={user}
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
        />
      </div>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden fixed inset-0 z-20"
              style={{ background: "rgba(1, 5, 17, 0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 z-30"
            >
              <Sidebar
                user={user}
                activeRoute={currentRoute}
                onNavigate={handleNavigate}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        className="pt-16 lg:pl-64 min-h-screen"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 70% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), " +
            "radial-gradient(ellipse at 10% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 40%)",
        }}
      >
        <motion.div
          key={currentRoute}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full min-h-[calc(100vh-4rem)]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// ─── Preview (optional — retirer ou brancher sur une route de démo) ───────────

function DemoPage() {
  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
          Tableau de bord
        </h1>
        <p className="text-sm mb-8" style={{ color: "#94a3b8" }}>
          Bienvenue sur votre espace Candly
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { label: "Candidatures envoyées", value: "12", color: "#22D3EE" },
            { label: "En cours d'examen", value: "4", color: "#F59E0B" },
            { label: "Acceptées", value: "2", color: "#10B981" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
            >
              <p className="text-sm mb-3" style={{ color: "#94a3b8" }}>{stat.label}</p>
              <p className="font-heading text-4xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 glass-card p-6">
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Layout Candly opérationnel — prêt pour le routage et l’API.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/** Aperçu local : import { LayoutPreview } from '@/components/layout/MainLayout' */
export function LayoutPreview() {
  const [route, setRoute] = useState("/dashboard");
  return (
    <MainLayout userRole="candidate" activeRoute={route} onNavigate={setRoute}>
      <DemoPage />
    </MainLayout>
  );
}
