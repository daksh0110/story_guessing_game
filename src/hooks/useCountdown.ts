import { useEffect, useState } from "react";

/** Whole seconds left until `endsAt` (epoch ms). Returns 0 when there is no deadline. */
export function useCountdown(endsAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) {
      return;
    }

    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (endsAt === null) {
    return 0;
  }

  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}
