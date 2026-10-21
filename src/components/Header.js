import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import { CATEGORIES_LIST, slugify } from "../utils/categoryHelper";
import logo from "../assets/logo/1.webp";
import { ResponsiveImage } from "./ResponsiveImage";
import { HeaderBackground } from "./header/HeaderBackground";
import { MobileNav } from "./header/MobileNav";

const imageIds = Array.from({ length: 10 }, (_, i) => 61 + i);

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
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const isHiDpi =
    typeof window !== "undefined" ? window.devicePixelRatio > 1.5 : false;

  const categories = CATEGORIES_LIST;

  const images = useMemo(() => {
    return imageIds.map((id) => {
      if (isMobile) return `/bg_images/640/${id}.webp`;
      return isHiDpi ? `/bg_images/${id}.webp` : `/bg_images/1280/${id}.webp`;
    });
  }, [isMobile, isHiDpi]);

  useEffect(() => {
    [0, 1].forEach((idx) => {
      const src = images[idx];
      if (src && !preloadedRef.current.has(src)) {
        const img = new Image();
        img.src = src;
        preloadedRef.current.add(src);
      }
    });
  }, [images]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
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
      <HeaderBackground
        images={images}
        currentIndex={currentIndex}
        nextIndex={nextIndex}
        isTransitioning={isTransitioning}
      />

      <div className="flex flex-col items-center justify-between h-full py-8 text-lg sm:text-xl md:text-2xl lg:text-3xl">
        {/* DESKTOP NAV */}
        <div className="hidden md:block">
          <nav className="relative z-10 bg-white/40 backdrop-blur-2xl md:flex hidden w-fit flex-row justify-center items-center gap-4 lg:gap-10 border-2 m-2 py-2 px-6 lg:px-20 border-black rounded-full shadow-lg">
            <div className="flex gap-4 lg:gap-10">
              <NavLink
                to="/"
                className={`rounded-full py-2 px-4 border-2 transition ${
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
                <div className="flex flex-row items-center gap-2 cursor-pointer">
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
                        to={`/categories/${slugify(cat)}`}
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
                width={301}
                height={262}
              />
            </Link>

            <div className="flex gap-4 lg:gap-10">
              <NavLink
                to="/authors"
                className={({ isActive }) =>
                  `rounded-full py-2 px-4 border-2 transition ${
                    isActive ? "font-bold border-black" : "border-transparent"
                  }`
                }
              >
                Auteurs
              </NavLink>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `rounded-full py-2 px-4 border-2 transition ${
                    isActive ? "font-bold border-black" : "border-transparent"
                  }`
                }
              >
                Blog
              </NavLink>
            </div>
          </nav>
        </div>

        <MobileNav
          menuRef={menuRef}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        {/* HERO BANNER & SEARCH INPUT */}
        <div className="text-center mx-auto flex flex-col items-center justify-center h-full">
          <p className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-black/75 tracking-tighter uppercase drop-shadow-sm mb-16">
            L'INSPIRATION SANS LIMITES
          </p>

          <div className="flex justify-between bg-white/90 backdrop-blur-sm border-black border-2 w-[85%] rounded-full text-xl p-2 gap-2 shadow-lg">
            <input
              className="p-2 bg-transparent border-none w-3/4 outline-none placeholder-gray-500"
              type="text"
              aria-label="Rechercher des citations"
              placeholder="Tapez votre recherche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
                  }
                }
              }}
            />

            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
                }
              }}
              aria-label="Lancer la recherche"
              className="bg-black text-white px-6 rounded-full font-semibold hover:bg-gray-800 transition-colors"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
