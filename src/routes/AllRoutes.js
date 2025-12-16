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
import { ArticleDetail, NotFound } from "../pages/index";

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
        <Route path=":slug" element={<AuthorQuote />} />
      </Route>

      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<ArticleDetail />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
