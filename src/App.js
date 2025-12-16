import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";

export const App = () => {
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      <AllRoutes />

      <CallToAction />

      <Footer />
    </div>
  );
};
