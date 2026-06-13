import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppLangProvider } from "./context/AppLangContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ActiveModeProvider } from "./context/ActiveModeContext.jsx";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme-screens.css";

// Remove static SEO prerender shell once React mounts (keeps view-source rich for crawlers).
document.getElementById("goovoiture-seo-prerender")?.remove();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppLangProvider>
          <SocketProvider>
            <ActiveModeProvider>
              <App />
            </ActiveModeProvider>
          </SocketProvider>
        </AppLangProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
