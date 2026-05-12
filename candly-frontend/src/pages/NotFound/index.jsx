import { Link } from "react-router";
import { ROUTES } from "../../routes/paths";

export default function NotFound() {
  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--app-bg)" }}

    >
      <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#22D3EE" }}>
        Erreur 404
      </p>
      <h1 className="font-heading text-3xl font-black mb-3" style={{ color: "#f1f5f9" }}>
        Page introuvable
      </h1>
      <p className="text-sm max-w-md mb-8" style={{ color: "#94a3b8" }}>
        L&apos;adresse demandée n&apos;existe pas ou a été déplacée.
      </p>
      <Link to={ROUTES.HOME} className="btn-primary">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
