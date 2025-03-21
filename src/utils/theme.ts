export function isDarkMode(): boolean {
  // Check system preference
  if (
    globalThis.matchMedia &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return true;
  }

  // Check time of day (dark mode between 6 PM and 6 AM)
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

// Apply theme directly to document body
export function applyThemeToBody(darkMode: boolean): void {
  if (typeof document !== "undefined") {
    document.body.style.backgroundColor = darkMode ? "#1a1a1a" : "#ffffff";
    document.body.style.color = darkMode ? "#ffffff" : "#000000";
  }
}

export const getThemeStyles = (darkMode: boolean) => ({
  input: {
    backgroundColor: darkMode ? "#333" : "#fff",
    color: darkMode ? "#fff" : "#000",
    border: `1px solid ${darkMode ? "#666" : "#ccc"}`,
  },
  button: {
    backgroundColor: darkMode ? "#444" : "#f0f0f0",
    color: darkMode ? "#fff" : "#000",
    border: `1px solid ${darkMode ? "#666" : "#ccc"}`,
  },
  error: {
    color: darkMode ? "#ff6b6b" : "#dc3545",
  },
});
