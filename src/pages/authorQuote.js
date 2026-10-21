import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QuoteSection } from "../components/QuoteSection";
import { AuthorBio } from "../components/AuthorBio";
import authors from "../assets/authors";
import { useTitle } from "../hooks";
import { getAuthorSrcSet } from "../utils/imageHelper";

export const AuthorQuote = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    imageIndex: stateImageIndex,
    imageUrl: stateImageUrl,
    name: stateName,
    bio: stateBio,
    birth: stateBirth,
    death: stateDeath,
    nationality: stateNationality,
    domain: stateDomain,
    knownFor: stateKnownFor,
  } = state;

  const decodedPath = decodeURIComponent(location.pathname.split("/").pop());
  const name = stateName || decodedPath.replace(/-/g, " ");

  const shouldLoadFromAPI = Object.keys(state).length === 0;
  useTitle({ title: `Quoter - ${name}` });

  const author = authors.find(
    (a) =>
      a.name.toLowerCase() === name.toLowerCase() ||
      a.name.toLowerCase().replace(/ /g, "-") === decodedPath.toLowerCase()
  );

  useEffect(() => {
    if (shouldLoadFromAPI && !author) {
      navigate("/not-found");
    }
  }, [shouldLoadFromAPI, author, navigate]);

  if (!author && shouldLoadFromAPI) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const imageUrl = stateImageUrl || author?.image || "";
  const { src: authorSrc, srcSet: authorSrcSet, sizes: authorSizes } =
    getAuthorSrcSet(imageUrl, [320, 640], "(max-width: 768px) 90vw, 450px");
  const imageIndex = stateImageIndex || author?.imageIndex || name;
  const bio = stateBio || author?.bio || "";
  const birth = stateBirth || author?.birth || "";
  const death = stateDeath || author?.death || "";
  const nationality = stateNationality || author?.nationality || "";
  const domain = stateDomain || author?.domain || "";
  const knownFor = stateKnownFor || author?.knownFor || "";

  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => navigate("/authors")}
        className="mb-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
      >
        ← Retour
      </button>

      <h1 className="text-4xl font-bold mb-15 text-center">{name}</h1>

      {imageUrl && (
        <>
          <AuthorBio
            name={name}
            imageUrl={imageUrl}
            authorSrc={authorSrc}
            authorSrcSet={authorSrcSet}
            authorSizes={authorSizes}
            imageIndex={imageIndex}
            bio={bio}
            birth={birth}
            death={death}
            nationality={nationality}
            domain={domain}
            knownFor={knownFor}
          />
          <QuoteSection name={name} />
        </>
      )}
    </div>
  );
};
