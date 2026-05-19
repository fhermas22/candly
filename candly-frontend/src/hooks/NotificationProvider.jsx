import { useMemo, useCallback, useState } from "react";
import { NotificationContext } from "./useNotifications";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = useCallback(({ message, type = "info", duration = 5000 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date();
    const notification = {
      id,
      message,
      type,
      createdAt,
      time: createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 6));

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ notifications, pushNotification, dismissNotification }),
    [notifications, pushNotification, dismissNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
