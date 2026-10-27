import { createContext } from "react";

export type SessionContextValue = {
  username: string;
  setUsername: (name: string) => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);
