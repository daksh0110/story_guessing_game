import { useState, type FormEvent } from "react";
import { useSession } from "@/hooks/useSession";
import { navigateTo } from "@/hooks/useHashRoute";
import { useCreateRoomMutation } from "@/services/api/roomApi";
import { syncRoomFromBackend } from "@/services/roomService";
import { useAppDispatch } from "@/store";
import { setRoom } from "@/store/slices/gameSlice";
import { getSocketId, joinSocketRoom } from "@/utils/socket";
import { isValidUsername } from "@/utils/validation";
import { getErrorMessage } from "@/utils/errors";
import { CATEGORIES, DIFFICULTIES, MAX_PLAYER_OPTIONS } from "@/constants/game";
import type { Category, Difficulty } from "@/types/game";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import OptionGroup from "@/components/ui/OptionGroup";
import StatusCard from "@/components/layout/StatusCard";

export default function CreateLobbyScreen() {
  const { username } = useSession();
  const dispatch = useAppDispatch();
  const [createRoomMutation, { isLoading: submitting }] =
    useCreateRoomMutation();

  const [category, setCategory] = useState<Category>("Comedy");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [maxPlayers, setMaxPlayers] = useState(MAX_PLAYER_OPTIONS[1]);
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
    setError(null);

    try {
      const response = await createRoomMutation({
        player_name: username,
        configuration: {
          category,
          difficulty: difficulty.toLowerCase(),
          max_players: maxPlayers,
        },
        socket_id: getSocketId(),
      }).unwrap();

      if (response.success && response.data) {
        syncRoomFromBackend(response.data, response.data.current_player);
        dispatch(setRoom(response.data));
        joinSocketRoom(response.data.code, response.data.current_player?.id);
        navigateTo(`/lobby/${response.data.code}`);
      } else {
        setError(response.message || "Failed to create room.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Create a lobby
        </h1>
        <p className="text-muted">
          Set the vibe, then invite your friends with the room code.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold">
              Story category
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg outline-none focus:border-teal"
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <OptionGroup
            label="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
          />

          <OptionGroup
            label="Max players"
            options={MAX_PLAYER_OPTIONS}
            value={maxPlayers}
            onChange={setMaxPlayers}
          />

          {error && (
            <p role="alert" className="font-medium text-coral-dark">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => navigateTo("/")}>
              Back
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create lobby"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
