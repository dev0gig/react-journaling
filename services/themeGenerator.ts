

/**
 * Wendet ein gegebenes Farbthema auf das :root-Element an,
 * indem CSS-Variablen gesetzt werden.
 * @param theme Ein Objekt, das CSS-Variablennamen auf Farbwerte abbildet.
 */
export function applyTheme(theme: Record<string, string>): void {
  if (!theme) return;

  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }
}