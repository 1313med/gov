import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppLangProvider } from "./context/AppLangContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme-screens.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppLangProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AppLangProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
