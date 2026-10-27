// Reads never throw (private mode or blocked storage falls back to the default).
// Writes are left to throw so callers can surface a full-storage error.

export function readStoredJson<T>(
  key: string,
  fallback: T,
  store: Storage = window.localStorage,
): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(
  key: string,
  value: unknown,
  store: Storage = window.localStorage,
): void {
  store.setItem(key, JSON.stringify(value));
}

export function readStoredText(
  key: string,
  store: Storage = window.localStorage,
): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredText(
  key: string,
  value: string,
  store: Storage = window.localStorage,
): void {
  store.setItem(key, value);
}
