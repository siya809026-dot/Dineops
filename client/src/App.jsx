
import { Moon, Sun } from "lucide-react";
import AppRouter from "./router/AppRouter";
import {
  ThemeProvider,
  useTheme,
} from "./context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className="dineops-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      {isLight ? (
        <Moon size={17} />
      ) : (
        <Sun size={17} />
      )}

      <span>
        {isLight ? "Dark mode" : "Light mode"}
      </span>
    </button>
  );
}

function AppContent() {
  return (
    <>
      <AppRouter />
      <ThemeToggle />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
