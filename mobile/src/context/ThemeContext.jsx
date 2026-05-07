import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkPalette, lightPalette } from "../theme";

const STORAGE_KEY = "goovoiture-theme-mode";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") setModeState(saved);
      setReady(true);
    });
  }, []);

  const setMode = useCallback(async (next) => {
    if (next !== "light" && next !== "dark") return;
    setModeState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = mode === "dark" ? "light" : "dark";
    await setMode(next);
  }, [mode, setMode]);

  const colors = useMemo(
    () => (mode === "light" ? lightPalette : darkPalette),
    [mode]
  );

  const value = useMemo(
    () => ({
      mode,
      ready,
      isDark: mode === "dark",
      colors,
      /** Alias for easy migration: same shape as legacy `C` */
      C: colors,
      setMode,
      toggleTheme,
    }),
    [mode, ready, colors, setMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
