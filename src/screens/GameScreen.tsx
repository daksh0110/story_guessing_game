import { useEffect } from "react";
import { useRoom } from "@/hooks/useRoom";
import { navigateTo } from "@/hooks/useHashRoute";
import { getCurrentPlayerId } from "@/services/roomService";
import Button from "@/components/ui/Button";
import StatusCard from "@/components/layout/StatusCard";
import DrawingScreen from "@/screens/DrawingScreen";
import GalleryScreen from "@/screens/GalleryScreen";

type GameScreenProps = {
  code: string;
};

/** Picks the right in-round view for the room's current status. */
export default function GameScreen({ code }: GameScreenProps) {
  const room = useRoom(code);
  const playerId = getCurrentPlayerId();

  // A host who resets the room sends everyone back to the lobby.
  useEffect(() => {
    if (room?.status === "lobby") {
      navigateTo(`/lobby/${room.code}`);
    }
  }, [room]);

  if (room === undefined) {
    return <StatusCard title="Loading round…" />;
  }

  if (room === null) {
    return (
      <StatusCard title="Game not found" description="This room no longer exists.">
        <Button onClick={() => navigateTo("/")}>Go to home</Button>
      </StatusCard>
    );
  }

  if (!room.players.some((player) => player.id === playerId)) {
    return (
      <StatusCard
        title="The game is already running"
        description="You need to join before the next round starts."
      >
        <Button variant="ghost" onClick={() => navigateTo("/")}>Go to home</Button>
      </StatusCard>
    );
  }

  if (room.status === "drawing") {
    return <DrawingScreen room={room} />;
  }

  if (room.status === "gallery") {
    return <GalleryScreen room={room} />;
  }

  return <StatusCard title="Heading back to the lobby…" />;
}
