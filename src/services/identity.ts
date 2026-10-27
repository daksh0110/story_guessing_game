import { readStoredText, writeStoredText } from "@/utils/storage";
import { createId } from "@/utils/id";

const PLAYER_ID_STORAGE_KEY = "storyframes:player-id";

/** One id per browser tab, so each open tab acts as a separate player. */
export function getCurrentPlayerId(): string {
  const existing = readStoredText(PLAYER_ID_STORAGE_KEY, window.sessionStorage);

  if (existing) {
    return existing;
  }

  const id = createId();
  writeStoredText(PLAYER_ID_STORAGE_KEY, id, window.sessionStorage);
  return id;
}

export function setCurrentPlayerId(id: string | number): void {
  writeStoredText(PLAYER_ID_STORAGE_KEY, String(id), window.sessionStorage);
}
