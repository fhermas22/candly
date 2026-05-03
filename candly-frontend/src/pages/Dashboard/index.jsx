import { motion } from "framer-motion";

/**
 * Tableau de bord candidat (contenu de démo — à remplacer par les vrais widgets).
 */
export default function Dashboard() {
  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
          Tableau de bord
        </h1>
        <p className="text-sm mb-8" style={{ color: "#94a3b8" }}>
          Bienvenue sur votre espace Candly
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { label: "Candidatures envoyées", value: "12", color: "#22D3EE" },
            { label: "En cours d'examen", value: "4", color: "#F59E0B" },
            { label: "Acceptées", value: "2", color: "#10B981" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
            >
              <p className="text-sm mb-3" style={{ color: "#94a3b8" }}>{stat.label}</p>
              <p className="font-heading text-4xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 glass-card p-6">
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Espace connecté — données et API à brancher ensuite.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
