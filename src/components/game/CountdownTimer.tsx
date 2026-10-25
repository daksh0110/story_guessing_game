import clsx from "clsx";
import Icon from "@/components/ui/Icon";
import timerIcon from "@/assets/svgs/icon-timer.svg";

type CountdownTimerProps = {
  seconds: number;
};

const URGENT_THRESHOLD_SECONDS = 10;

export default function CountdownTimer({ seconds }: CountdownTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, "0");
  const urgent = seconds <= URGENT_THRESHOLD_SECONDS;

  return (
    <div
      role="timer"
      aria-label={`${seconds} seconds left`}
      className={clsx(
        "flex items-center gap-2 rounded-2xl px-4 py-3 font-display text-2xl font-semibold tabular-nums",
        urgent ? "bg-coral text-white" : "border-2 border-ink/10 bg-white",
      )}
    >
      <Icon src={timerIcon} className={clsx("h-5 w-5", urgent && "invert")} />
      {minutes}:{remainder}
    </div>
  );
}
