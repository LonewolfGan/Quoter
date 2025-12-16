import { useLocation, useNavigate } from "react-router-dom";
import { QuoteSection } from "../components/QuoteSection";
import authors from "../assets/authors/authors";

export const AuthorQuote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  /* const {
    imageIndex,
    imageUrl,
    name,
    bio,
    birth,
    death,
    nationality,
    domain,
    knownFor,
  } = location.state || {}; */

  const name =
    location.state?.name ||
    decodeURIComponent(location.pathname.split("/").pop());
  const author = authors.find((author) => author.name === name);
  const imageUrl = author.image;
  const imageIndex = author?.imageIndex || author.name;
  const bio = author.bio;
  const birth = author.birth;
  const death = author.death;
  const nationality = author.nationality;
  const domain = author.domain;
  const knownFor = author.knownFor;
  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => navigate("/authors")}
        className="mb-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
      >
        ← Retour
      </button>

      <h1 className="text-4xl font-bold mb-15 text-center">{name}</h1>

      {imageUrl && (
        <>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-40 items-center mt-10">
            {/* IMAGE */}
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={`CarouselImage ${imageIndex}`}
                className=" w-[350px] md:w-[450px] rounded-2xl shadow-xl"
              />
            </div>

            {/* BIO + INFOS MONOCHROME */}
            <div className="space-y-8">
              {/* BIO ENRICHIE */}
              <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-lg">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-xl">
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="#000000"
                      data-darkreader-inline-color=""
                    >
                      <path
                        d="M20 12V5.74853C20 5.5894 19.9368 5.43679 19.8243 5.32426L16.6757 2.17574C16.5632 2.06321 16.4106 2 16.2515 2H4.6C4.26863 2 4 2.26863 4 2.6V21.4C4 21.7314 4.26863 22 4.6 22H11"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-darkreader-inline-stroke=""
                      ></path>
                      <path
                        d="M8 10H16M8 6H12M8 14H11"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-darkreader-inline-stroke=""
                      ></path>
                      <path
                        d="M16.3056 17.1133L17.2147 15.1856C17.3314 14.9381 17.6686 14.9381 17.7853 15.1856L18.6944 17.1133L20.7275 17.4243C20.9884 17.4642 21.0923 17.7998 20.9035 17.9923L19.4326 19.4917L19.7797 21.61C19.8243 21.882 19.5515 22.0895 19.3181 21.961L17.5 20.9603L15.6819 21.961C15.4485 22.0895 15.1757 21.882 15.2203 21.61L15.5674 19.4917L14.0965 17.9923C13.9077 17.7998 14.0116 17.4642 14.2725 17.4243L16.3056 17.1133Z"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-darkreader-inline-stroke=""
                      ></path>
                      <path
                        d="M16 2V5.4C16 5.73137 16.2686 6 16.6 6H20"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-darkreader-inline-stroke=""
                      ></path>
                    </svg>
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-light tracking-wide p-5">
                  {bio}
                </p>
              </div>

              {/* INFOS EN CARDS RESPONSIVES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                {/* Nationalité */}
                <div className="group flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-gray-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl ">
                      <svg
                        width="24px"
                        height="24px"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                        data-darkreader-inline-color=""
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="#000000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M2.5 12.5L8 14.5L7 18L8 21"
                          stroke="#000000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M17 20.5L16.5 18L14 17V13.5L17 12.5L21.5 13"
                          stroke="#000000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M19 5.5L18.5 7L15 7.5V10.5L17.5 9.5H19.5L21.5 10.5"
                          stroke="#000000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M2.5 10.5L5 8.5L7.5 8L9.5 5L8.5 3"
                          stroke="#000000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">
                      Nationalité
                    </p>
                    <p className="font-bold text-gray-900 text-base truncate group-hover:text-gray-900">
                      {nationality}
                    </p>
                  </div>
                </div>

                {/* Période */}
                <div className="group flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-gray-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">
                      <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                        data-darkreader-inline-color=""
                      >
                        <path
                          d="M10 21H5C3.89543 21 3 20.1046 3 19V10H21M15 4V2M15 4V6M15 4H10.5"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M3 10V6C3 4.89543 3.89543 4 5 4H7"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M7 2V6"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M21 10V6C21 4.89543 20.1046 4 19 4H18.5"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M21.6669 16.6667C21.0481 15.097 19.635 14 17.9906 14C16.2322 14 14.7382 15.2545 14.1973 17"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M19.9951 16.772H21.4001C21.7314 16.772 22.0001 16.5034 22.0001 16.172V14.5498"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M14.3341 19.3333C14.9529 20.903 16.366 22 18.0103 22C19.7687 22 21.2628 20.7455 21.8037 19"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M16.0049 19.228H14.5999C14.2686 19.228 13.9999 19.4966 13.9999 19.828V21.4502"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">
                      Période
                    </p>
                    <p className="font-bold text-gray-900 text-base truncate group-hover:text-gray-900">
                      {birth} {death ? `— ${death}` : "— Présent"}
                    </p>
                  </div>
                </div>

                {/* Domaine */}
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-gray-300">
                  <div className="w-12 h-12  rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">
                      <svg
                        width="24px"
                        height="24px"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                        data-darkreader-inline-color=""
                      >
                        <path
                          d="M3 9.5L12 4L21 9.5"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M5 20H19"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M10 9L14 9"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M6 17L6 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M10 17L10 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M14 17L14 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M18 17L18 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">
                      Domaine
                    </p>
                    <p className="font-bold text-gray-900 text-base  group-hover:text-gray-900">
                      {domain}
                    </p>
                  </div>
                </div>

                {/* Connu pour */}
                <div className="group flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-gray-300">
                  <div className="w-12 h-12  rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">
                      <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                        data-darkreader-inline-color=""
                      >
                        <path
                          d="M9.95242 9.62272L11.5109 6.31816C11.711 5.89395 12.289 5.89395 12.4891 6.31816L14.0476 9.62272L17.5329 10.1559C17.9801 10.2243 18.1583 10.7996 17.8346 11.1296L15.313 13.7001L15.9081 17.3314C15.9845 17.7978 15.5168 18.1534 15.1167 17.9331L12 16.2177L8.88328 17.9331C8.48316 18.1534 8.01545 17.7978 8.09187 17.3314L8.68695 13.7001L6.16545 11.1296C5.8417 10.7996 6.01993 10.2243 6.46711 10.1559L9.95242 9.62272Z"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M22 12L23 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M12 2V1"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M12 23V22"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M20 20L19 19"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M20 4L19 5"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M4 20L5 19"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M4 4L5 5"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                        <path
                          d="M1 12L2 12"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          data-darkreader-inline-stroke=""
                        ></path>
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider font-medium text-gray-600 mb-1">
                      Connu pour
                    </p>
                    <p className="font-bold text-gray-900 text-base leading-tight group-hover:text-gray-900">
                      {knownFor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION CITATIONS */}
          <QuoteSection name={name} />
        </>
      )}
    </div>
  );
};
