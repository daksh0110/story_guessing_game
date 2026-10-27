import { useCallback, useEffect, useRef, useState } from "react";
import type { Room } from "@/types/game";
import type { Stroke } from "@/types/drawing";
import {
  finishRound,
  getCurrentPlayerId,
  submitDrawing,
} from "@/services/roomService";
import { publishDrawingEvent } from "@/services/drawingChannel";
import { useCountdown } from "@/hooks/useCountdown";
import { useDrawingStrokes } from "@/hooks/useDrawingStrokes";
import { ROUND_GRACE_MS } from "@/constants/game";
import { getErrorMessage } from "@/utils/errors";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DrawingCanvas from "@/components/ui/drawing/DrawingCanvas";
import CountdownTimer from "@/components/game/CountdownTimer";
import DrawingTile from "@/components/game/DrawingTile";
import ScenePromptCard from "@/components/game/ScenePromptCard";

type DrawingScreenProps = {
  room: Room;
};

export default function DrawingScreen({ room }: DrawingScreenProps) {
  const playerId = getCurrentPlayerId();
  const me = room.players.find((player) => player.id === playerId);
  const isArtist = me?.team === "artists";
  const submitted = room.drawings[playerId] !== undefined;

  const artists = room.players.filter((player) => player.team === "artists");
  const submittedCount = artists.filter((artist) => room.drawings[artist.id] !== undefined).length;
  const teammates = artists.filter((artist) => artist.id !== playerId);

  const secondsLeft = useCountdown(room.roundEndsAt);
  const timeUp = room.roundEndsAt !== null && secondsLeft === 0;
  const liveStrokes = useDrawingStrokes(room.code);

  const strokesRef = useRef<Stroke[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefer the submitted strokes. Until then, show whatever the log says so far.
  const strokesFor = (id: string): Stroke[] | undefined => {
    if (room.drawings[id]) {
      return room.drawings[id];
    }

    return liveStrokes[id]?.length ? liveStrokes[id] : undefined;
  };

  const badgeFor = (id: string): string | undefined => {
    if (room.drawings[id]) {
      return "Done";
    }

    return liveStrokes[id]?.length ? "Live" : undefined;
  };

  const submit = useCallback(async () => {
    try {
      await submitDrawing(room.code, strokesRef.current);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  }, [room.code]);

  // Artists are submitted automatically when the timer reaches zero. A late
  // submission that the service rejects is harmless, so the error is ignored here.
  useEffect(() => {
    if (!isArtist || submitted || room.roundEndsAt === null) {
      return;
    }

    if (secondsLeft === 0) {
      submitDrawing(room.code, strokesRef.current).catch(() => {});
    }
  }, [isArtist, submitted, room.code, room.roundEndsAt, secondsLeft]);

  // Move to the gallery as soon as every artist has submitted.
  useEffect(() => {
    if (artists.length > 0 && submittedCount === artists.length) {
      finishRound(room.code).catch(() => {});
    }
  }, [artists.length, submittedCount, room.code]);

  // Fallback: end the round after the timer and grace period, even if someone is stuck.
  useEffect(() => {
    if (room.roundEndsAt === null) {
      return;
    }

    const delay = room.roundEndsAt + ROUND_GRACE_MS + 100 - Date.now();
    const id = window.setTimeout(() => {
      finishRound(room.code).catch(() => {});
    }, Math.max(0, delay));

    return () => window.clearTimeout(id);
  }, [room.roundEndsAt, room.code]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <ScenePromptCard prompt={isArtist ? room.scenes[playerId] : undefined} />

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <CountdownTimer seconds={secondsLeft} />
          <p className="text-sm font-semibold text-muted">
            {submittedCount} / {artists.length} drawn
          </p>
        </div>
      </div>

      {isArtist ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="space-y-4">
            <DrawingCanvas
              readOnly={submitted || timeUp}
              onChange={(strokes) => {
                strokesRef.current = strokes;
              }}
              // Every action is published the moment it happens, so teammates
              // and guessers see it without waiting for "Done".
              onStrokeComplete={(stroke) =>
                publishDrawingEvent(room.code, { type: "drawing.stroke", stroke })
              }
              onUndo={(stroke) =>
                publishDrawingEvent(room.code, { type: "drawing.undo", strokeId: stroke.id })
              }
              onRedo={(stroke) =>
                publishDrawingEvent(room.code, { type: "drawing.stroke", stroke })
              }
              onClear={() => publishDrawingEvent(room.code, { type: "drawing.clear" })}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {submitted
                  ? "Locked in. Waiting for your teammates."
                  : "Draw only your scene. Your teammates' sketches show up on the right."}
              </p>

              <Button onClick={submit} disabled={submitted}>
                {submitted ? "Submitted" : "Done drawing"}
              </Button>
            </div>

            {submitError && (
              <p role="alert" className="font-medium text-coral-dark">
                {submitError}
              </p>
            )}
          </Card>

          <aside className="grid content-start grid-cols-2 gap-3 lg:grid-cols-1">
            {teammates.length === 0 && (
              <p className="col-span-full rounded-2xl bg-white p-4 text-sm text-muted">
                You're the only artist this round.
              </p>
            )}

            {teammates.map((teammate) => (
              <DrawingTile
                key={teammate.id}
                name={teammate.name}
                strokes={strokesFor(teammate.id)}
                badge={badgeFor(teammate.id)}
                placeholder="Still drawing…"
              />
            ))}
          </aside>
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-muted">
            You're guessing this round. Watch the artists' drawings appear, then rebuild the story.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {artists.map((artist) => (
              <DrawingTile
                key={artist.id}
                name={artist.name}
                strokes={strokesFor(artist.id)}
                badge={badgeFor(artist.id)}
                placeholder="Still drawing…"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
