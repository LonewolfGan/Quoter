import { Link } from "react-router-dom";
import { useTitle } from "../hooks";
import {
  Heart,
  Sparkles,
  Smile,
  Brain,
  Trophy,
  Users,
  Flower2,
  Zap,
  BookOpen,
  Lightbulb,
  Sprout,
  Rocket,
} from "lucide-react";

const categoryIcons = {
  Amour: Heart,
  Liberté: Rocket,
  Inspiration: Sparkles,
  Motivation: Zap,
  Bonheur: Smile,
  Sagesse: Brain,
  Amitié: Users,
  Vie: Flower2,
  Force: Zap,
  Espoir: Sprout,
  Paix: Flower2,
  Connaissance: BookOpen,
  Créativité: Lightbulb,
  Réussite: Trophy,
  default: Sparkles,
};

export const Categories = () => {
  const title = "Quoter - Categories";
  useTitle({ title });
  const categories = [
    "Amour",
    "Amitié",
    "Bonheur",
    "Vie",
    "Motivation",
    "Réussite",
    "Philosophie",
    "Sagesse",
    "Liberté",
    "Espoir",
  ].sort();

  return (
    <main className="p-8 ">
      <h1 className="text-5xl md:text-6xl font-black text-center mb-12">
        Catégories
      </h1>
      <p className="text-center text-2xl text-gray-900 mb-12">
        Explorez les citations par thématiques
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {categories.map((category) => {
          const Icon = categoryIcons[category] || categoryIcons.default; // Icône par défaut si pas de match

          return (
            <Link
              key={category}
              to={`/categories/${category}`}
              className="group relative bg-gray-50 hover:bg-zinc-100 text-black font-semibold rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center py-10 px-6 hover:scale-105 hover:shadow-zinc-600/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon
                className="w-16 h-16 mb-4 text-black/80 group-hover:text-black transition-colors"
                strokeWidth={1.5}
              />
              <span className="text-xl md:text-2xl tracking-wide text-black">
                {category}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
};
