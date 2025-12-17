import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import { App } from "./App";
import { QuoteProvider } from "./context/QuoteContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QuoteProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </QuoteProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Enregistrement du service worker pour la mise en cache
serviceWorkerRegistration.register();
