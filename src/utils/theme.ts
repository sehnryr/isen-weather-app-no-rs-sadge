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

export const getThemeStyles = (darkMode: boolean) => ({
  container: {
    backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
    minHeight: "100vh",
    padding: "20px",
  },
  input: {
    backgroundColor: darkMode ? "#333" : "#fff",
    color: darkMode ? "#fff" : "#000",
    border: `1px solid ${darkMode ? "#666" : "#ccc"}`,
    padding: "8px",
    borderRadius: "4px",
  },
  button: {
    backgroundColor: darkMode ? "#444" : "#f0f0f0",
    color: darkMode ? "#fff" : "#000",
    border: "none",
    padding: "8px 16px",
    margin: "0 4px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: darkMode ? "#ff6b6b" : "#dc3545",
    marginTop: "10px",
  },
});
