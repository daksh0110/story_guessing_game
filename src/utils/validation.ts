import {
  ROOM_CODE_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/constants/game";

export function validateUsername(name: string): string | null {
  const length = name.trim().length;

  if (length < USERNAME_MIN_LENGTH) {
    return `Pick a name with at least ${USERNAME_MIN_LENGTH} characters.`;
  }

  if (length > USERNAME_MAX_LENGTH) {
    return `Keep it to ${USERNAME_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

export function isValidUsername(name: string): boolean {
  return validateUsername(name) === null;
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return normalizeRoomCode(code).length === ROOM_CODE_LENGTH;
}
