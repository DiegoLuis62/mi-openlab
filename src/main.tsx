import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import './index.css';
import { AuthProvider } from './context/AuthProvider';
import { DarkModeProvider } from './context/DarkModeContext'; // Importa el provider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <DarkModeProvider> {/* Envuelve con DarkModeProvider */}
        <App />
      </DarkModeProvider>
    </AuthProvider>
  </React.StrictMode>
);
