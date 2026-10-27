import { useEffect, useState } from "react";
import { getRoom, subscribeToRooms } from "@/services/roomService";
import type { Room } from "@/types/game";

/** `undefined` while loading, `null` when the room does not exist. */
export function useRoom(code: string): Room | null | undefined {
  const [room, setRoom] = useState<Room | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const refresh = () => {
      getRoom(code).then((next) => {
        if (active) {
          setRoom(next);
        }
      });
    };

    refresh();
    const unsubscribe = subscribeToRooms(refresh);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [code]);

  return room;
}
