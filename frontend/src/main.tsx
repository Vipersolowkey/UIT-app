import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const savedTheme = localStorage.getItem("theme") || "light";
const root = document.documentElement;

root.classList.remove("light", "dark", "mono");
root.classList.add(savedTheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);