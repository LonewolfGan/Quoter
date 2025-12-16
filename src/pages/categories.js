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
} from "lucide-react"; // Assurez-vous d'installer lucide-react : npm install lucide-react

// Définissez un mapping pour associer une icône à chaque catégorie (ajustez selon vos catégories réelles)
const categoryIcons = {
  Amour: Heart,
  Love: Heart,
  Inspiration: Sparkles,
  Motivation: Zap,
  Bonheur: Smile,
  Happiness: Smile,
  Sagesse: Brain,
  Wisdom: Brain,
  Succès: Trophy,
  Success: Trophy,
  Amitié: Users,
  Friendship: Users,
  Vie: Flower2,
  Life: Flower2,
  Force: Zap,
  Strength: Zap,
  Paix: Flower2,
  Peace: Flower2,
  Connaissance: BookOpen,
  Knowledge: BookOpen,
  Créativité: Lightbulb,
  Creativity: Lightbulb,
  // Ajoutez d'autres catégories ici selon vos besoins
};

export const Categories = () => {
  const title = "Quoter - Categories";
  useTitle({ title });
  // Extract unique categories
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
    <main className="p-8 min-h-screen">
      <h1 className="text-5xl md:text-6xl font-black text-center mb-12">
        Catégories
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {categories.map((category) => {
          const Icon = categoryIcons[category] || Sparkles; // Icône par défaut si pas de match

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
