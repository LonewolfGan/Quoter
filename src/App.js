import { Header } from "./components/Header";
import { AllRoutes } from "./routes/AllRoutes";
import { CallToAction } from "./components/CallToAction";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import CookieConsent from "react-cookie-consent";

export const App = () => {
  useScrollToTop();
  const location = useLocation();
  const gaInitializedRef = useRef(false);
  const GA_MEASUREMENT_ID = "G-Z4DXEWLV52";
  const CONSENT_COOKIE_NAME = "quoterConsent";
  const CONSENT_ACCEPTED = "accepted";
  const CONSENT_REJECTED = "rejected";
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const isHttps = window.location.protocol === "https:";

  const getCookieConsentValue = useCallback(
    () =>
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
        ?.split("=")[1],
    [CONSENT_COOKIE_NAME],
  );

  const hasAcceptedCookies = useCallback(
    () => {
      const consent = getCookieConsentValue();
      return consent === "true" || consent === CONSENT_ACCEPTED;
    },
    [getCookieConsentValue],
  );

  const clearAnalyticsCookies = useCallback(() => {
    const measurementSuffix = GA_MEASUREMENT_ID.replace(/^G-/, "");
    const gaCookies = ["_ga", "_gid", "_gat", `_ga_${measurementSuffix}`];
    const securePart = isHttps ? " Secure;" : "";

    gaCookies.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax;${securePart}`;
    });
  }, [GA_MEASUREMENT_ID, isHttps]);

  const initGA = useCallback(() => {
    if (gaInitializedRef.current || isLocalhost) return;
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        cookie_domain: window.location.hostname,
      },
      gtagOptions: {
        cookie_domain: window.location.hostname,
        cookie_flags: isHttps ? "SameSite=Lax;Secure" : "SameSite=Lax",
        cookie_update: false,
        cookie_expires: 63072000,
        send_page_view: false,
      },
    });
    gaInitializedRef.current = true;
  }, [isHttps, isLocalhost]);

  const trackPageView = useCallback(() => {
    if (!gaInitializedRef.current) return;
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    // Check if user has accepted cookies before tracking
    if (hasAcceptedCookies()) {
      initGA();
      // Send pageview to GA4 on route change only if consent given
      trackPageView();
    }
  }, [location.pathname, hasAcceptedCookies, initGA, trackPageView]);

  const handleCookieAccept = () => {
    initGA();
    trackPageView();
  };

  const handleCookieDecline = () => {
    clearAnalyticsCookies();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <AllRoutes />
      <CallToAction />
      <CookieConsent
        location="none"
        enableDeclineButton
        buttonText="Accepter"
        declineButtonText="Refuser"
        cookieName={CONSENT_COOKIE_NAME}
        cookieValue={CONSENT_ACCEPTED}
        declineCookieValue={CONSENT_REJECTED}
        setDeclineCookie={true}
        sameSite="Lax"
        cookieSecurity={isHttps && !isLocalhost}
        expires={365}
        hideOnDecline={true}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          padding: "24px",
          width: "350px",
          bottom: "24px",
          right: "24px",
          left: "auto",
          borderRadius: "16px",
          flexDirection: "column",
          alignItems: "stretch",
          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
          zIndex: "1000",
        }}
        buttonStyle={{
          background: "#000000",
          color: "#ffffff",
          fontWeight: "600",
          borderRadius: "12px",
          padding: "12px 24px",
          fontSize: "14px",
          margin: "8px 0 0 0",
          width: "100%",
          cursor: "pointer",
        }}
        declineButtonStyle={{
          background: "transparent",
          color: "#6b7280",
          fontWeight: "500",
          borderRadius: "12px",
          padding: "10px 24px",
          fontSize: "14px",
          border: "1px solid #e5e7eb",
          margin: "8px 0 0 0",
          width: "100%",
          cursor: "pointer",
        }}
        contentStyle={{
          fontSize: "14px",
          color: "#374151",
          margin: "0 0 16px 0",
          flex: "none",
        }}
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-lg">
              Préférences de confidentialité
            </span>
          </div>
          <p className="leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience et
            analyser l'utilisation du site.
          </p>
        </div>
      </CookieConsent>
    </div>
  );
};
