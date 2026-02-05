import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import ReactGA from "react-ga4";
import "./index.css";
import { App } from "./App";
import { QuoteProvider } from "./context/QuoteContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Initialize Google Analytics (GA4)
ReactGA.initialize("G-Z4DXEWLV52");

root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QuoteProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </QuoteProvider>
    </BrowserRouter>
  </React.StrictMode>
);
