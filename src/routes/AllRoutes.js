import { Routes, Route } from "react-router-dom";
import {
  Home,
  Categories,
  Blog,
  AuthorQuote,
  CategoryQuotes,
  Search,
} from "../pages/index";
import { AuthorsLayout } from "../layouts/AuthorsLayout";

export const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/search" element={<Search />} />
      {/* Route dynamique pour les catégories */}
      <Route path="/categories/:slug" element={<CategoryQuotes />} />

      {/* Authors avec layout persistent */}
      <Route path="/authors" element={<AuthorsLayout />}>
        <Route index element={null} />{" "}
        {/* Page principale vide, le carousel est dans le layout */}
        <Route path="quote" element={<AuthorQuote />} />
        <Route path="quote/:slug" element={<AuthorQuote />} />
      </Route>

      <Route path="/blog" element={<Blog />} />
    </Routes>
  );
};
