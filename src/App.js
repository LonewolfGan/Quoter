import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const App = () => {
  useScrollToTop();

  const navigate = useNavigate();

  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  if (redirect) {
    navigate(redirect, { replace: true });
  }
}, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      <AllRoutes />

      <CallToAction />

      <Footer />
      <SpeedInsights />
      <Analytics />
    </div>
  );
};
