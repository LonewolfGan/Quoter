import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("../pages/home").then((m) => ({ default: m.Home })));
const Categories = lazy(() =>
  import("../pages/categories").then((m) => ({ default: m.Categories })),
);
const Blog = lazy(() => import("../pages/blog").then((m) => ({ default: m.Blog })));
const AuthorQuote = lazy(() =>
  import("../pages/authorQuote").then((m) => ({ default: m.AuthorQuote })),
);
const CategoryQuotes = lazy(() =>
  import("../pages/categoryQuotes").then((m) => ({ default: m.CategoryQuotes })),
);
const Search = lazy(() =>
  import("../pages/search").then((m) => ({ default: m.Search })),
);
const AuthorsLayout = lazy(() =>
  import("../layouts/AuthorsLayout").then((m) => ({ default: m.AuthorsLayout })),
);
const ArticleDetail = lazy(() =>
  import("../pages/articleDetail").then((m) => ({ default: m.ArticleDetail })),
);
const NotFound = lazy(() =>
  import("../pages/notFound").then((m) => ({ default: m.NotFound })),
);

const PageFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
      <p className="text-lg">Chargement...</p>
    </div>
  </div>
);

export const AllRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        {/* Route dynamique pour les catégories */}
        <Route path="/categories/:slug" element={<CategoryQuotes />} />

        {/* Authors avec layout persistent */}
        <Route path="/authors" element={<AuthorsLayout />}>
          <Route index element={null} />
          <Route path=":name" element={<AuthorQuote />} />
        </Route>

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<ArticleDetail />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
