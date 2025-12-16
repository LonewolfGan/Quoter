import { Link, useLocation } from "react-router-dom";

export const CallToAction = () => {
  const location = useLocation();
  const path = location.pathname;

  // Configuration par défaut
  let content = {
    title: "Envie de plus d'inspiration ?",
    text: "Découvrez notre citation du jour et explorez des milliers d'autres citations",
    buttons: [
      { label: "Citation du jour", to: "/", primary: false },
      { label: "Explorer les catégories", to: "/categories", primary: true },
      { label: "Explorer les auteurs", to: "/authors", primary: false },
    ],
  };

  // Configuration spécifique selon la page
  if (path === "/") {
    content = {
      title: "Vous aimez cette citation ?",
      text: "Découvrez des milliers d'autres citations inspirantes",
      buttons: [
        { label: "Explorer les catégories", to: "/categories", primary: false },
        { label: "Voir les auteurs", to: "/authors", primary: true },
        { label: "Voir le blog", to: "/blog", primary: false },
      ],
    };
  } else if (path.startsWith("/blog")) {
    content = {
      title: "Envie de plus de leçons de vie ?",
      text: "Explorez nos milliers de citations et trouvez l'inspiration qui vous correspond",
      buttons: [
        { label: "Découvrir la citation du jour", to: "/", primary: false },
        { label: "Explorer les catégories", to: "/categories", primary: true },
        { label: "Explorer les auteurs", to: "/authors", primary: false },
      ],
    };
  } else if (path.startsWith("/categories")) {
    content = {
      title: "Vous cherchez un auteur spécifique ?",
      text: "Parcourez notre liste d'auteurs célèbres pour plus d'inspiration",
      buttons: [
        { label: "Découvrir la citation du jour", to: "/", primary: false },
        { label: "Voir les auteurs", to: "/authors", primary: true },
        { label: "Voir le blog", to: "/blog", primary: false },
      ],
    };
  } else if (path.startsWith("/authors")) {
    content = {
      title: "Explorez par thématique",
      text: "Trouvez des citations par sujet qui vous passionne",
      buttons: [
        { label: "Découvrir la citation du jour", to: "/", primary: false },
        { label: "Explorer les catégories", to: "/categories", primary: true },
        { label: "Voir le blog", to: "/blog", primary: false },
      ],
    };
  }

  return (
    <div className="max-w-6xl mx-auto px-4 mb-20">
      <div className="bg-black text-white rounded-2xl border-2 border-black p-8 text-center mt-12 shadow-xl">
        <h3 className="text-2xl font-bold mb-4">{content.title}</h3>
        <p className="text-lg mb-6 text-gray-300">{content.text}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {content.buttons.map((btn, index) => (
            <Link
              key={index}
              to={btn.to}
              className={`px-8 py-4 rounded-full transition-all font-semibold ${
                btn.primary
                  ? "bg-white text-black hover:bg-gray-100"
                  : "border-2 border-white hover:bg-white hover:text-black"
              }`}
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
