import { useEffect, useState } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { navigateTo } from "@/hooks/useHashRoute";
import {
  getCurrentPlayerId,
  leaveRoom,
  setReady,
  setTeam,
  startGame,
} from "@/services/roomService";
import { getStartBlocker } from "@/utils/lobbyRules";
import { getErrorMessage } from "@/utils/errors";
import { isValidUsername } from "@/utils/validation";
import type { Team } from "@/types/game";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import OptionGroup from "@/components/ui/OptionGroup";
import StatusCard from "@/components/layout/StatusCard";
import RoomCodeBadge from "@/components/game/RoomCodeBadge";
import TeamPanel from "@/components/game/TeamPanel";

type LobbyScreenProps = {
  code: string;
};

const TEAM_OPTIONS: readonly Team[] = ["artists", "guessers"];
const TEAM_LABELS: Record<Team, string> = { artists: "Artist", guessers: "Guesser" };

export default function LobbyScreen({ code }: LobbyScreenProps) {
  const room = useRoom(code);
  const { username } = useSession();
  const playerId = getCurrentPlayerId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Everyone moves into the game once the host starts it.
  useEffect(() => {
    if (room && room.status !== "lobby") {
      navigateTo(`/game/${room.code}`);
    }
  }, [room]);

  if (room === undefined) {
    return <StatusCard title="Loading lobby…" />;
  }

  if (room === null) {
    return (
      <StatusCard
        title="Lobby not found"
        description={`No lobby is open with the code ${code}. Check the code and try again.`}
      >
        <Button onClick={() => navigateTo("/join")}>Enter a code</Button>
        <Button variant="ghost" onClick={() => navigateTo("/")}>Home</Button>
      </StatusCard>
    );
  }

  const me =
    room.players.find((player) => player.id === playerId) ||
    room.players.find(
      (player) =>
        Boolean(username) &&
        player.name.trim().toLowerCase() === username.trim().toLowerCase(),
    );

  if (!me) {
    return (
      <StatusCard
        title="You're not in this lobby yet"
        description="Join with your name to take a seat."
      >
        <Button variant="secondary" onClick={() => navigateTo(`/join/${room.code}`)}>
          Join lobby {room.code}
        </Button>
      </StatusCard>
    );
  }

  if (!isValidUsername(username)) {
    return (
      <StatusCard title="Add your name first" description="Choose a display name on the home page.">
        <Button onClick={() => navigateTo("/")}>Go to home</Button>
      </StatusCard>
    );
  }

  const isHost = room.hostId === playerId;
  const startBlocker = getStartBlocker(room);
  const artists = room.players.filter((p) => p.team === "artists");
  const guessers = room.players.filter((p) => p.team === "guessers");

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);

    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    await leaveRoom(room.code);
    navigateTo("/");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <RoomCodeBadge code={room.code} />

          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-sun px-3 py-1">{room.settings.category}</span>
            <span className="rounded-full bg-paper px-3 py-1">{room.settings.difficulty}</span>
            <span className="rounded-full bg-paper px-3 py-1">
              {room.players.length} / {room.settings.maxPlayers} players
            </span>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Teams</h2>
            <p className="text-sm text-muted">Pick a side. Artists draw while guessers watch.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TeamPanel
              team="artists"
              players={artists}
              hostId={room.hostId}
              currentPlayerId={playerId}
            />
            <TeamPanel
              team="guessers"
              players={guessers}
              hostId={room.hostId}
              currentPlayerId={playerId}
            />
          </div>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="space-y-5">
          <OptionGroup
            label="Your team"
            options={TEAM_OPTIONS}
            value={me.team}
            formatOption={(team) => TEAM_LABELS[team]}
            onChange={(team) => runAction(() => setTeam(room.code, team))}
          />

          <Button
            block
            variant={me.ready ? "secondary" : "primary"}
            disabled={busy}
            onClick={() => runAction(() => setReady(room.code))}
          >
            {me.ready ? "Ready! Tap to undo" : "I'm ready"}
          </Button>
        </Card>

        {isHost && (
          <Card className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Host controls</h2>
              <p className="text-sm text-muted">
                {startBlocker ?? "Everything is set. Start when you're ready."}
              </p>
            </div>

            <Button
              block
              disabled={busy || startBlocker !== null}
              onClick={() => runAction(() => startGame(room.code))}
            >
              Start game
            </Button>
          </Card>
        )}

        {error && (
          <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 font-medium text-coral-dark">
            {error}
          </p>
        )}

        <Button variant="danger" block onClick={handleLeave}>
          Leave lobby
        </Button>
      </aside>
    </div>
  );
}
