import { useState, type FormEvent } from "react";
import { useSession } from "@/hooks/useSession";
import { navigateTo } from "@/hooks/useHashRoute";
import { useJoinRoomMutation } from "@/services/api/roomApi";
import { syncRoomFromBackend } from "@/services/roomService";
import { useAppDispatch } from "@/store";
import { setRoom } from "@/store/slices/gameSlice";
import { getSocketId } from "@/utils/socket";
import {
  isValidRoomCode,
  isValidUsername,
  normalizeRoomCode,
} from "@/utils/validation";
import { getErrorMessage } from "@/utils/errors";
import { ROOM_CODE_LENGTH } from "@/constants/game";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import StatusCard from "@/components/layout/StatusCard";

type JoinLobbyScreenProps = {
  /** Prefilled when the page is opened from an invite link. */
  initialCode?: string;
};

export default function JoinLobbyScreen({
  initialCode = "",
}: JoinLobbyScreenProps) {
  const { username } = useSession();
  const dispatch = useAppDispatch();
  const [joinRoomMutation, { isLoading: submitting }] = useJoinRoomMutation();

  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);

  if (!isValidUsername(username)) {
    return (
      <StatusCard
        title="Add your name first"
        description="Head back to the home page and choose a display name."
      >
        <Button onClick={() => navigateTo("/")}>Go to home</Button>
      </StatusCard>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isValidRoomCode(code)) {
      setError(`Room codes are ${ROOM_CODE_LENGTH} characters long.`);
      return;
    }

    setError(null);

    try {
      const response = await joinRoomMutation({
        code: normalizeRoomCode(code),
        player_name: username,
        socket_id: getSocketId(),
      }).unwrap();

      if (response.success && response.data) {
        syncRoomFromBackend(response.data, response.data.current_player);
        dispatch(setRoom(response.data));
        navigateTo(`/lobby/${response.data.code}`);
      } else {
        setError(response.message || "Failed to join room.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Join a lobby
        </h1>
        <p className="text-muted">Ask the host for the room code.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            label="Room code"
            name="roomCode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={ROOM_CODE_LENGTH}
            placeholder="ABCD"
            value={code}
            error={error}
            onChange={(event) => {
              setCode(normalizeRoomCode(event.target.value));
              setError(null);
            }}
            className="text-center font-display text-3xl font-bold uppercase tracking-[0.3em]"
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => navigateTo("/")}>
              Back
            </Button>

            <Button type="submit" variant="secondary" disabled={submitting}>
              {submitting ? "Joining…" : "Join lobby"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
