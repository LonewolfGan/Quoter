import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import logo from "../assets/logo/1.webp";
import { ResponsiveImage } from "./ResponsiveImage";

// Les images sont maintenant dans le dossier public/bg_images
const imageIds = Array.from({ length: 10 }, (_, i) => 61 + i);

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

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const dropRef = useRef(null);
  const menuRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const preloadedRef = useRef(new Set());
  const currentIndexRef = useRef(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const isHiDpi =
    typeof window !== "undefined" ? window.devicePixelRatio > 1.5 : false;

  const images = useMemo(() => {
    return imageIds.map((id) => {
      if (isMobile) return `/bg_images/640/${id}.webp`;
      return isHiDpi ? `/bg_images/${id}.webp` : `/bg_images/1280/${id}.webp`;
    });
  }, [isMobile, isHiDpi]);

  // Précharge seulement les images proches pour limiter le coût initial
  useEffect(() => {
    const preloadImage = (index) => {
      if (index < 0 || index >= images.length) return;
      const src = images[index];
      if (preloadedRef.current.has(src)) return;
      const img = new Image();
      img.src = src;
      preloadedRef.current.add(src);
    };

    preloadImage(0);
    preloadImage(1);
  }, [images]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images]);

  // Effet pour la rotation des images
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let timeout1, timeout2;
    let isMounted = true;
    let intervalId;

    const preloadImage = (index) => {
      if (index < 0 || index >= images.length) return;
      const src = images[index];
      if (preloadedRef.current.has(src)) return;
      const img = new Image();
      img.src = src;
      preloadedRef.current.add(src);
    };

    const rotateImages = () => {
      if (!isMounted) return;

      const next = (currentIndexRef.current + 1) % images.length;
      preloadImage(next);
      preloadImage((next + 1) % images.length);
      setNextIndex(next);

      timeout1 = setTimeout(() => {
        if (isMounted) setIsTransitioning(true);
      }, 50);

      timeout2 = setTimeout(() => {
        if (!isMounted) return;
        setCurrentIndex(next);
        currentIndexRef.current = next;
        setIsTransitioning(false);
      }, 1550);
    };

    const initialDelay = setTimeout(() => {
      if (!isMounted) return;
      intervalId = setInterval(rotateImages, 8000);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(initialDelay);
    };
  }, [images]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setDrop(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative h-[100dvh] overflow-hidden">
      {/* BACKGROUND avec double couche pour transition fluide */}
      <div className="absolute z-0 inset-0">
        {/* Couche de base - toujours visible */}
        {images && images.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              opacity: 0.5,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              willChange: "opacity",
              transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            onError={(e) => {
              console.error(
                "Erreur de chargement de l'image de fond:",
                images[currentIndex],
              );
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Couche de transition - apparaît par-dessus */}
        {images && images.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url(${images[nextIndex]})`,
              opacity: isTransitioning ? 0.5 : 0,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              willChange: "opacity",
              transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            onError={(e) => {
              console.error(
                "Erreur de chargement de l'image de transition:",
                images[nextIndex],
              );
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Overlay gradient pour meilleure lisibilité */}
        <div className="absolute inset-0 border-b" />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center justify-between h-full py-8 text-lg sm:text-xl md:text-2xl lg:text-3xl">
        {/* NAV EN HAUT */}
        <div className="hidden md:block">
          <nav className="relative z-10 bg-white/40 backdrop-blur-2xl md:flex hidden w-fit flex-row justify-center items-center gap-10 border-2 m-2 py-2 px-20 border-black rounded-full shadow-lg">
            <div className="flex gap-10">
              <NavLink
                to="/"
                className={`rounded-full py-2 px-4 border-2 transition
     ${
       location.pathname === "/"
         ? "font-bold border-black"
         : "border-transparent"
     }`}
              >
                Accueil
              </NavLink>

              <div
                className={`relative z-50 rounded-full py-2 px-4 border-2 transition ${
                  location.pathname === "/categories"
                    ? "border-black font-bold"
                    : "border-transparent"
                }`}
                ref={dropRef}
              >
                <div
                  className={`flex flex-row items-center gap-2 cursor-pointer `}
                >
                  <NavLink to="/categories">Catégories</NavLink>
                  <span
                    className={`text-xl transition-transform duration-300 ${
                      drop ? "rotate-180" : ""
                    }`}
                    onClick={() => setDrop(!drop)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>

                {/* DROPDOWN avec animation */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white/95 backdrop-blur-sm text-black border-2 border-black rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto transition-all duration-300 origin-top ${
                    drop
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="flex flex-col p-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/categories/${cat}`}
                        className="block px-4 py-2 hover:bg-gray-100 rounded-lg text-black text-center transition-colors"
                        onClick={() => setDrop(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link to="/" className="transition-transform hover:scale-105">
              <ResponsiveImage
                className="w-24"
                src={logo}
                alt="logo"
                loading="eager"
                decoding="async"
              />
            </Link>

            <div className="flex gap-10">
              <NavLink
                to="/authors"
                className={({ isActive }) =>
                  `rounded-full py-2 px-4 border-2 transition
     ${isActive ? "font-bold border-black" : "border-transparent"}`
                }
              >
                Auteurs
              </NavLink>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `rounded-full py-2 px-4 border-2 transition
     ${isActive ? "font-bold border-black" : "border-transparent"}`
                }
              >
                Blog
              </NavLink>
            </div>
          </nav>
        </div>

        {/* MOBILE NAV */}
        <nav
          ref={menuRef}
          className="relative z-10 flex md:hidden justify-between items-center w-[90%] bg-white/95 backdrop-blur-sm border-2 m-2 mx-4 p-2 border-black rounded-full shadow-lg"
        >
          <Link to="/" className="transition-transform hover:scale-105">
            <ResponsiveImage
              className="w-24"
              src={logo}
              alt="logo"
              loading="eager"
              decoding="async"
            />
          </Link>
          <div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-700 rounded-full outline-none focus:border-black focus:border transition-transform hover:scale-110"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Menu mobile avec animation */}
          <div
            className={`absolute top-full left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-2 border-black rounded-2xl mt-2 p-6 shadow-xl transition-all duration-300 origin-top ${
              menuOpen
                ? "flex flex-col items-center opacity-100 scale-100"
                : "hidden opacity-0 scale-95"
            }`}
          >
            <ul className="flex flex-col items-center justify-center space-y-8">
              <li>
                <NavLink
                  onClick={() => setMenuOpen(false)}
                  to="/categories"
                  className={({ isActive }) => `
                  font-bold border-2 rounded-full w-full py-2  px-10
                    ${isActive ? "border-black" : "border-transparent"}`}
                >
                  Catégories
                </NavLink>
              </li>
              <li>
                <NavLink
                  onClick={() => setMenuOpen(false)}
                  to="/authors"
                  className={({ isActive }) => `
                  font-bold border-2  rounded-full w-full py-2  px-10
                    ${isActive ? "border-black" : "border-transparent"}`}
                >
                  Auteurs
                </NavLink>
              </li>
              <li>
                <NavLink
                  onClick={() => setMenuOpen(false)}
                  to="/blog"
                  className={({ isActive }) => `
                  font-bold border-2  rounded-full w-full py-2  px-10
                    ${isActive ? "border-black" : "border-transparent"}`}
                >
                  Blog
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <div className="text-center mx-auto flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-black/75 tracking-tighter uppercase drop-shadow-sm mb-16">
            L'INSPIRATION SANS LIMITES
          </h1>

          {/* SEARCH INPUT AU MILIEU */}
          <div className="flex justify-between bg-white/90 backdrop-blur-sm border-black border-2 w-[85%]  rounded-full text-xl p-2 gap-2 shadow-lg">
            <input
              className="p-2 bg-transparent border-none w-3/4 outline-none placeholder-gray-500"
              type="text"
              placeholder="Rechercher......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  event.target.blur();
                  setSearchQuery("");
                  if (searchQuery.trim().length > 0) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }
              }}
            />
            <button
              onClick={() => {
                if (searchQuery.trim().length > 0) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery("");
                }
              }}
              className="text-white bg-black rounded-full p-2 w-1/4 text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap overflow-hidden text-ellipsis hover:bg-gray-800 transition-colors active:scale-95"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
