import { useSyncExternalStore } from "react";

const STORAGE_KEY = "pistis-theme";
const listeners = new Set();

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
};

const apply = (theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

let current = readStored() ?? systemTheme();
apply(current);

const emit = () => listeners.forEach((fn) => fn());

export const setTheme = (theme) => {
  current = theme;
  apply(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    void e;
  }
  emit();
};

export const toggleTheme = () => setTheme(current === "dark" ? "light" : "dark");

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (readStored()) return;
  current = e.matches ? "dark" : "light";
  apply(current);
  emit();
});

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, () => current);
  return { theme, isDark: theme === "dark", setTheme, toggleTheme };
};
