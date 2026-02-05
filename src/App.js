import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import CookieConsent from "react-cookie-consent";

export const App = () => {
  useScrollToTop();
  const location = useLocation();

  useEffect(() => {
    // Check if user has accepted cookies before tracking
    const cookieConsent = document.cookie.split('; ').find(row => row.startsWith('quoterConsent='));
    if (cookieConsent) {
      // Send pageview to GA4 on route change only if consent given
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }, [location.pathname]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <AllRoutes />
      <CallToAction />
      <SpeedInsights />
      <Analytics />
      <CookieConsent
        location="bottom"
        buttonText="J'accepte"
        cookieName="quoterConsent"
        style={{ background: "#000" }}
        buttonStyle={{
          background: "#fff",
          color: "#000",
          borderRadius: "20px",
          padding: "10px 30px",
        }}
      >
        Ce site utilise des cookies pour améliorer votre expérience.
      </CookieConsent>
    </div>
  );
};
