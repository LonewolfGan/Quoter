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
      {/* Carousel uniquement sur /authors pour éviter les listeners/RAF inutiles */}
      {showCarousel ? (
        <div className="flex flex-col items-center m-auto h-full">
          <h1 className="text-6xl md:text-9xl leading-10 font-black text-center mt-20">
            Authors
          </h1>
          <Carousel3D onCardClick={handleCardClick} />
        </div>
      ) : null}

      {/* Pages enfants (authorQuote) s'affichent ici */}
      <Outlet />
    </main>
  );
};
