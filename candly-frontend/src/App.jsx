import { BrowserRouter } from "react-router";

import AppRoutes from "./routes/AppRoutes";

/**
 * Racine de l’app : historique HTML5 + définition des routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
