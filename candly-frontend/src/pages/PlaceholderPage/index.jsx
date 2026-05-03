/**
 * Page temporaire pour les routes encore en construction.
 */
export default function PlaceholderPage({ title, description = "Cette section sera bientôt reliée aux données Candly." }) {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
        {title}
      </h1>
      <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
        {description}
      </p>
    </div>
  );
}
