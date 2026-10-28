import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./theme";

const ThemeToggle = ({ className, variant = "icon" }) => {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "switch") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={label}
        title={label}
        onClick={toggleTheme}
        className={clsx("obsidian-switch", className)}
      >
        <span className="obsidian-switch__thumb">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={clsx(
        "p-2 rounded-lg transition text-gray-700 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800",
        className
      )}
    >
      {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
