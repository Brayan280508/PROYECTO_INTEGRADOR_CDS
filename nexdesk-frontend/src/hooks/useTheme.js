import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const guardado = localStorage.getItem("solvix_theme");
    if (guardado === "light" || guardado === "dark") return guardado;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const aplicarTema = useCallback((nuevoTema) => {
    setTheme(nuevoTema);
    localStorage.setItem("solvix_theme", nuevoTema);
    document.documentElement.setAttribute("data-bs-theme", nuevoTema);
  }, []);

  const toggleTheme = useCallback(() => {
    aplicarTema(theme === "dark" ? "light" : "dark");
  }, [theme, aplicarTema]);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    // Escuchar cambios de preferencia del SO si no hay selección manual guardada
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const guardado = localStorage.getItem("solvix_theme");
      if (!guardado) {
        aplicarTema(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, aplicarTema]);

  return { theme, isDark: theme === "dark", toggleTheme, setTheme: aplicarTema };
}
