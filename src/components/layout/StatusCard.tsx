import type { ReactNode } from "react";
import Card from "@/components/ui/Card";

type StatusCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

/** Used for loading, not-found, and "you need to do X first" states. */
export default function StatusCard({ title, description, children }: StatusCardProps) {
  return (
    <Card className="mx-auto max-w-lg space-y-4 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>

      {description && <p className="text-muted">{description}</p>}

      {children && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      )}
    </Card>
  );
}
