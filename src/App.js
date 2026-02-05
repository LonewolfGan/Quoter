import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export const App = () => {
  useScrollToTop();
  const location = useLocation();

  useEffect(() => {
    // Send pageview to GA4 on route change
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, [location.pathname]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <AllRoutes />
      <CallToAction />
      <SpeedInsights />
      <Analytics />
    </div>
  );
};
