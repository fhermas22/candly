import { Routes, Route } from "react-router";

import MainLayout from "../components/layout/MainLayout";
import Landing from "../pages/Landing";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import PlaceholderPage from "../pages/PlaceholderPage";
import NotFound from "../pages/NotFound";

import { ROUTES } from "./paths";

/**
 * Arborescence des routes de l’application Candly.
 * Layout candidat et admin : routes relatives sous un layout sans segment (pathless).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Landing />} />
      <Route path={ROUTES.AUTH} element={<Auth />} />

      <Route element={<MainLayout userRole="candidate" />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route
          path={ROUTES.OFFRES}
          element={<PlaceholderPage title="Rechercher des offres" />}
        />
        <Route
          path={ROUTES.CANDIDATURES}
          element={<PlaceholderPage title="Mes candidatures" />}
        />
        <Route
          path={ROUTES.PROFIL}
          element={<PlaceholderPage title="Mon profil" />}
        />
      </Route>

      <Route path={ROUTES.ADMIN} element={<MainLayout userRole="admin" />}>
        <Route
          index
          element={<PlaceholderPage title="Supervision" description="Vue d’ensemble administration — à connecter au backend." />}
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
