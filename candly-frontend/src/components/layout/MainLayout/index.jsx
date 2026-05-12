/**
 * MainLayout for Candly.
 * Navbar (top) + Sidebar (left) + Page content.
 * Wraps authenticated pages.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useLocation,
  useNavigate,
  Outlet,
  MemoryRouter,
  Routes,
  Route,
  Link,
} from "react-router";
import { auth } from "../../../utils/auth.js";
import { useNotifications } from "../../../hooks/useNotifications";

import CandidateDashboard from "../../../pages/CandidateDashboard";
import { ROUTES } from "../../../routes/paths";

// ─── Generic fallback (never display real-person names) ──────────
const MOCK_USER = {
  name: "Candidat",
  email: "candidat@candly.io",
  role: "candidate", // "candidate" | "admin"
  avatarInitials: "CD",
  avatarColor: "#22D3EE",
};

// ─── Navigation definitions ───────────────────────────────────────────────────
const CANDIDATE_NAV = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    href: ROUTES.DASHBOARD,

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
    label: "Recherche d’offres",
    href: ROUTES.OFFRES,
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
    href: ROUTES.CANDIDATURES,
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
    href: ROUTES.PROFIL,
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
    label: "Tableau de bord",
    href: ROUTES.ADMIN,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0" width={20} height={20} aria-hidden>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "jobs-admin",
    label: "Gestion des offres",
    href: ROUTES.ADMIN_OFFRES,
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
    href: ROUTES.ADMIN_CANDIDATS,
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
    href: ROUTES.ADMIN_CANDIDATURES,
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
function NavItem({ item, isActive, index, onNavClick }) {
  return (
    <motion.div
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        to={item.href}
        onClick={onNavClick}
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
      </Link>
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
function Navbar({
  user,
  onMenuToggle,
  isSidebarOpen,
  breadcrumbLabel = "Tableau de bord",
  onOpenSettings,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, dismissNotification } = useNotifications();
  const notificationCount = notifications.length;

  const roleBadge = user.role === "admin"
    ? { label: "Administrateur", color: "#10B981" }
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
          aria-label="Open menu"
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
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 grid place-items-center rounded-full px-1.5 text-[10px] font-semibold"
                style={{ background: "#22D3EE", color: "#020617" }}
              >
                {notificationCount}
              </span>
            )}
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
                <div className="flex items-center justify-between mb-3">
                  <p className="font-heading text-sm font-semibold" style={{ color: "#f1f5f9" }}>
                    Notifications
                  </p>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Fermer
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="rounded-2xl p-4 text-sm text-slate-400 bg-slate-950/60">
                      Aucune notification récente.
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const dotColor = item.type === "error" ? "#f43f5e" : item.type === "success" ? "#10B981" : "#22D3EE";
                      return (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-700/70">
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: dotColor }} />
                          <div className="min-w-0">
                            <p className="text-sm truncate" style={{ color: "#e2e8f0" }}>{item.message}</p>
                            <p className="text-[11px] mt-1" style={{ color: "#64748b" }}>{item.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismissNotification(item.id)}
                            className="text-[11px] text-slate-400 hover:text-slate-100"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  )}
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
          <div className="hidden sm:block max-w-30">
            <p className="text-xs font-medium leading-tight truncate" style={{ color: "#f1f5f9" }}>
              {user.name.split(" ")[0]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
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
function Sidebar({ user, activeRoute, onNavClick, onSignOut }) {
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
            onNavClick={onNavClick}
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
            onClick={onSignOut}
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
 * @param {React.ReactNode} [props.children]  - Si défini, remplace `<Outlet />` (hors routeur)
 * @param {string}  [props.userRole]          - "candidate" | "admin"
 * @param {string}  [props.breadcrumbLabel]   - Surcharge du fil d’Ariane (desktop)
 */
export default function MainLayout({
  children,
  userRole = "candidate",
  breadcrumbLabel,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = location.pathname;
  const storedUser = auth.getUser();
  const sessionRole = storedUser?.role ?? userRole;
  const user = {
    ...MOCK_USER,
    role: sessionRole,
    name: storedUser?.displayName ?? MOCK_USER.name,
    email: storedUser?.email ?? MOCK_USER.email,
    avatarInitials: storedUser?.avatarInitials ?? MOCK_USER.avatarInitials,
    avatarColor: storedUser?.avatarColor ?? MOCK_USER.avatarColor,
    photoUrl: storedUser?.profile?.photo_url ?? null,
  };

  const handleSignOut = () => {
    auth.logout();
    navigate(ROUTES.AUTH, { replace: true });
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate(ROUTES.AUTH, { replace: true });
      return;
    }

    if (storedUser?.role && storedUser.role !== userRole) {
      const fallback = storedUser.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      navigate(fallback, { replace: true });
    }
  }, [navigate, userRole, storedUser?.role]);

  const navItems = user.role === "admin" ? ADMIN_NAV : CANDIDATE_NAV;
  const resolvedBreadcrumb =
    breadcrumbLabel ??
    navItems.find((item) => item.href === currentRoute)?.label ??
    navItems.find((item) => currentRoute.startsWith(item.href))?.label ??
    "Tableau de bord";

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleOpenSettings = () => {
    navigate(user.role === "admin" ? ROUTES.ADMIN : ROUTES.PROFIL);
  };

  const content = children ?? <Outlet />;

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      <Navbar
        user={user}
        onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
        isSidebarOpen={mobileSidebarOpen}
        breadcrumbLabel={resolvedBreadcrumb}
        onOpenSettings={handleOpenSettings}
      />

      <div className="hidden lg:block">
        <Sidebar
          user={user}
          activeRoute={currentRoute}
          onNavClick={closeMobileSidebar}
          onSignOut={handleSignOut}
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
                onNavClick={closeMobileSidebar}
                onSignOut={handleSignOut}
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
          {content}
        </motion.div>
      </main>
    </div>
  );
}

// ─── Preview (hors routeur global) ───────────────────────────────────────────

/** Aperçu : import { LayoutPreview } from '@/components/layout/MainLayout' */
export function LayoutPreview() {
  return (
    <MemoryRouter initialEntries={[ROUTES.DASHBOARD]}>
      <Routes>
        <Route element={<MainLayout userRole="candidate" />}>
          <Route path="dashboard" element={<CandidateDashboard />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
