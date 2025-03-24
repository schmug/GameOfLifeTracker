import { createRoot } from "react-dom/client";
import App from "./App";
import GitHubPagesApp from "./GitHubPagesApp";
import "./index.css";

// Check if we're running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

createRoot(document.getElementById("root")!).render(
  isGitHubPages ? <GitHubPagesApp /> : <App />
);
