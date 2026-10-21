import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo/1.webp";
import { ResponsiveImage } from "../ResponsiveImage";

export const MobileNav = ({ menuRef, menuOpen, setMenuOpen }) => {
  return (
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
          width={301}
          height={262}
        />
      </Link>
      <div>
        <button
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        id="mobile-menu"
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
              font-bold border-2 rounded-full w-full py-2 px-10
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
              font-bold border-2 rounded-full w-full py-2 px-10
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
              font-bold border-2 rounded-full w-full py-2 px-10
                ${isActive ? "border-black" : "border-transparent"}`}
            >
              Blog
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};
