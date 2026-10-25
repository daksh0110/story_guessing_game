import { io, type Socket } from "socket.io-client";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export const socket: Socket = io(backendUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export function getSocketId(): string | null {
  return socket.id ?? null;
}

export function joinSocketRoom(
  code: string,
  playerId?: number,
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    if (!socket.connected) {
      resolve({ success: false, message: "Socket not connected" });
      return;
    }
    socket.emit("room.join", { code, player_id: playerId }, (response: unknown) => {
      resolve(
        (response as { success: boolean; message?: string }) ?? { success: true },
      );
    });
  });
}

export function associatePlayerSocket(
  playerId: number,
  roomCode?: string,
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    if (!socket.connected) {
      resolve({ success: false, message: "Socket not connected" });
      return;
    }
    socket.emit(
      "player.associate",
      { player_id: playerId, room_code: roomCode },
      (response: unknown) => {
        resolve(
          (response as { success: boolean; message?: string }) ?? { success: true },
        );
      },
    );
  });
}
