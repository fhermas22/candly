import { BrowserRouter } from "react-router";
import { NotificationProvider } from "./hooks/NotificationProvider";

import AppRoutes from "./routes/AppRoutes";

/**
 * App root: HTML5 history + routes definition.
 */
export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </BrowserRouter>
  );
}
