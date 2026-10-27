import { useCallback, useMemo, useState, type ReactNode } from "react";
import { readStoredText, writeStoredText } from "@/utils/storage";
import { SessionContext } from "@/context/SessionContext";

const USERNAME_STORAGE_KEY = "storyframes:username";

type SessionProviderProps = {
  children: ReactNode;
};

export default function SessionProvider({ children }: SessionProviderProps) {
  const [username, setUsernameState] = useState(
    () => readStoredText(USERNAME_STORAGE_KEY) ?? "",
  );

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    setUsernameState(trimmed);

    try {
      writeStoredText(USERNAME_STORAGE_KEY, trimmed);
    } catch {
      // Storage is blocked or full. The name still works for this page session.
    }
  }, []);

  const value = useMemo(
    () => ({ username, setUsername }),
    [username, setUsername],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
