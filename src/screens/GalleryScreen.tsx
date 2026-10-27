import { useCallback, useState } from "react";
import type { Room } from "@/types/game";
import { getCurrentPlayerId, resetLobby } from "@/services/roomService";
import { getErrorMessage } from "@/utils/errors";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DrawingLightbox, { type LightboxDrawing } from "@/components/game/DrawingLightbox";
import DrawingTile from "@/components/game/DrawingTile";

type GalleryScreenProps = {
  room: Room;
};

export default function GalleryScreen({ room }: GalleryScreenProps) {
  const playerId = getCurrentPlayerId();
  const isHost = room.hostId === playerId;
  const artists = room.players.filter((player) => player.team === "artists");
  const [focused, setFocused] = useState<LightboxDrawing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const closeLightbox = useCallback(() => setFocused(null), []);

  const playAgain = async () => {
    setBusy(true);
    setError(null);

    try {
      await resetLobby(room.code);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">The comic is in!</h1>
        <p className="text-muted">
          Every scene card is revealed. Tap a drawing to see it up close, then compare
          it with the story you guessed.
        </p>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => {
          const strokes = room.drawings[artist.id];
          const caption = room.scenes[artist.id];

          return (
            <DrawingTile
              key={artist.id}
              name={artist.name}
              strokes={strokes}
              caption={caption}
              placeholder="No drawing was submitted"
              onOpen={strokes ? () => setFocused({ name: artist.name, strokes, caption }) : undefined}
            />
          );
        })}
      </section>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {error ? (
          <p role="alert" className="font-medium text-coral-dark">
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted">
            {isHost
              ? "Start another round whenever your group is ready."
              : "Waiting for the host to start another round."}
          </p>
        )}

        {isHost && (
          <Button onClick={playAgain} disabled={busy}>
            Play another round
          </Button>
        )}
      </div>

      <DrawingLightbox drawing={focused} onClose={closeLightbox} />
    </div>
  );
}
