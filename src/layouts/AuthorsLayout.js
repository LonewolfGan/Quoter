import { Outlet, useLocation } from "react-router-dom";
import { Carousel3D } from "../components/index";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../hooks";

export const AuthorsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = "Quoter - Authors";
  useTitle({ title });
  // Affiche le carousel seulement sur la page principale /authors
  const showCarousel = location.pathname === "/authors";

  const handleCardClick = (
    index,
    imageUrl,
    name,
    bio,
    birth,
    death,
    nationality,
    domain,
    knownFor
  ) => {
    navigate(`/authors/${name}`, {
      state: {
        imageIndex: index,
        imageUrl: imageUrl,
        name: name,
        bio: bio,
        birth: birth,
        death: death,
        nationality: nationality,
        domain: domain,
        knownFor: knownFor,
      },
    });
  };

  return (
    <main>
      {/* Carousel reste monté mais caché quand on est sur authorQuote */}
      <div
        style={{ display: showCarousel ? "block" : "none" }}
        className="flex justify-center items-center m-auto h-full"
      >
        <h1 className="text-6xl md:text-9xl leading-10 font-black text-center mt-20">
          Authors
        </h1>
        <Carousel3D onCardClick={handleCardClick} />
      </div>

      {/* Pages enfants (authorQuote) s'affichent ici */}
      <Outlet />
    </main>
  );
};
