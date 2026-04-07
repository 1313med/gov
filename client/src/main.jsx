import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppLangProvider } from "./context/AppLangContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLangProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppLangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
