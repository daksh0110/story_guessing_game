import clsx from "clsx";
import type { Player, Team } from "@/types/game";
import Icon from "@/components/ui/Icon";
import crownIcon from "@/assets/svgs/icon-crown.svg";

type TeamPanelProps = {
  team: Team;
  players: Player[];
  hostId: string;
  currentPlayerId: string;
};

const TEAM_DETAILS: Record<Team, { title: string; description: string; accentClass: string }> = {
  artists: {
    title: "Artists",
    description: "Each draws one secret scene card.",
    accentClass: "bg-coral",
  },
  guessers: {
    title: "Guessers",
    description: "Watch the comic and rebuild the story.",
    accentClass: "bg-teal",
  },
};

export default function TeamPanel({ team, players, hostId, currentPlayerId }: TeamPanelProps) {
  const details = TEAM_DETAILS[team];

  return (
    <section
      aria-label={`${details.title} team`}
      className="space-y-3 rounded-2xl border-2 border-ink/10 bg-white p-4"
    >
      <div className="flex items-start gap-3">
        <span className={clsx("mt-1.5 h-3 w-3 shrink-0 rounded-full", details.accentClass)} />
        <div>
          <h3 className="font-display text-lg font-semibold">
            {details.title} <span className="text-muted">({players.length})</span>
          </h3>
          <p className="text-sm text-muted">{details.description}</p>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="rounded-xl bg-paper px-3 py-4 text-center text-sm text-muted">
          No one here yet
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                {player.id === hostId && (
                  <Icon src={crownIcon} alt="Host" className="h-4 w-4" />
                )}
                <span className="truncate font-medium">{player.name}</span>
                {player.id === currentPlayerId && (
                  <span className="shrink-0 text-xs text-muted">(you)</span>
                )}
              </span>

              <span
                className={clsx(
                  "shrink-0 text-xs font-semibold",
                  player.ready ? "text-teal-dark" : "text-muted",
                )}
              >
                {player.ready ? "Ready" : "Waiting"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
