/**
 * Archivo: frontend/src/modules/appearance/panelThemes.js
 * Función: fuente única para los templates visuales del panel, normalización y aplicación
 *          del tema seleccionado sin tocar la lógica funcional de los módulos.
 * Trabaja con: Layout.jsx, Login.jsx, App.js y Ajustes > General.
 */
export const PANEL_THEME_DARK = "dark";
export const PANEL_THEME_ZHUB_LIGHT = "zhub-light";
export const PANEL_THEME_STORAGE_KEY = "zhub_panel_theme";

export const PANEL_THEMES = [
  {
    id: PANEL_THEME_DARK,
    name: "Oscuro clásico",
    description: "Diseño actual del panel. Fondo oscuro, tarjetas grafito y acentos cian.",
  },
  {
    id: PANEL_THEME_ZHUB_LIGHT,
    name: "Z-Hub Claro Suave",
    description: "Template claro de baja luminancia: gris azulado suave, superficies claras sin blanco puro y acentos azul, cian y turquesa.",
  },
];

export function normalizePanelTheme(value) {
  return PANEL_THEMES.some((theme) => theme.id === value) ? value : PANEL_THEME_DARK;
}

export function applyPanelTheme(value, { persist = true } = {}) {
  const theme = normalizePanelTheme(value);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.panelTheme = theme;
  }
  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(PANEL_THEME_STORAGE_KEY, theme);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zhub-theme-changed", { detail: { theme } }));
  }
  return theme;
}

export function bootstrapPanelTheme() {
  if (typeof window === "undefined") return PANEL_THEME_DARK;
  const stored = window.localStorage.getItem(PANEL_THEME_STORAGE_KEY);
  return applyPanelTheme(stored || PANEL_THEME_DARK, { persist: false });
}

export function getStoredPanelTheme() {
  if (typeof window === "undefined") return PANEL_THEME_DARK;
  return normalizePanelTheme(window.localStorage.getItem(PANEL_THEME_STORAGE_KEY));
}

export function getToastTheme() {
  return getStoredPanelTheme() === PANEL_THEME_ZHUB_LIGHT ? "light" : "dark";
}
