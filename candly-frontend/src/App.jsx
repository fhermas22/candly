import { BrowserRouter } from "react-router";

import AppRoutes from "./routes/AppRoutes";

/**
 * App root: HTML5 history + routes definition.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
