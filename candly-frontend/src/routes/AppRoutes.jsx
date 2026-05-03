import { Routes, Route } from "react-router";

import MainLayout from "../components/layout/MainLayout";
import Landing from "../pages/Landing";
import Auth from "../pages/Auth";
import CandidateDashboard from "../pages/CandidateDashboard";
import PlaceholderPage from "../pages/PlaceholderPage";
import AdminPanel from "../pages/AdminPanel";
import ProfileSettings from "../pages/ProfileSettings";
import NotFound from "../pages/NotFound";

import { ROUTES } from "./paths";

/**
 * Application routes tree.
 * Candidate and admin layouts: relative routes under pathless layout.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Landing />} />
      <Route path={ROUTES.AUTH} element={<Auth />} />

      <Route element={<MainLayout userRole="candidate" />}>
        <Route path={ROUTES.DASHBOARD} element={<CandidateDashboard />} />
        <Route
          path={ROUTES.OFFRES}
          element={<PlaceholderPage title="Job Search" />}
        />
        <Route
          path={ROUTES.CANDIDATURES}
          element={<PlaceholderPage title="Mes candidatures" />}
        />
        <Route
          path={ROUTES.PROFIL}
          element={<ProfileSettings />}
        />
      </Route>

      <Route path={ROUTES.ADMIN} element={<MainLayout userRole="admin" />}>
        <Route
          index
          element={<AdminPanel />}
        />
        <Route
          path="offres"
          element={<PlaceholderPage title="Gestion des offres" />}
        />
        <Route
          path="candidats"
          element={<PlaceholderPage title="Gestion des candidats" />}
        />
        <Route
          path="candidatures"
          element={<PlaceholderPage title="Revue des candidatures" />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
