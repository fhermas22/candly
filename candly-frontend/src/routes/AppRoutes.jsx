import { Routes, Route } from "react-router";

import MainLayout from "../components/layout/MainLayout";
import Landing from "../pages/Landing";
import Auth from "../pages/Auth";
import CandidateDashboard from "../pages/CandidateDashboard";
import CandidateApplications from "../pages/CandidateApplications";
import JobSearch from "../pages/JobSearch";
import JobDetail from "../pages/JobDetail";
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
        <Route path={ROUTES.OFFRES} element={<JobSearch />} />
        <Route path={`${ROUTES.OFFRES}/:jobId`} element={<JobDetail />} />
        <Route path={ROUTES.CANDIDATURES} element={<CandidateApplications />} />
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
          element={<AdminPanel />}
        />
        <Route
          path="candidats"
          element={<AdminPanel />}
        />
        <Route
          path="candidatures"
          element={<AdminPanel />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
