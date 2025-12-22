import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

export const App = () => {
  useScrollToTop();

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
