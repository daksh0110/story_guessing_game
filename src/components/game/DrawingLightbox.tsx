import { useEffect } from "react";
import type { Stroke } from "@/types/drawing";
import Button from "@/components/ui/Button";
import StrokePreview from "@/components/ui/drawing/StrokePreview";

export type LightboxDrawing = {
  name: string;
  strokes?: Stroke[];
  caption?: string;
};

type DrawingLightboxProps = {
  drawing: LightboxDrawing | null;
  onClose: () => void;
};

export default function DrawingLightbox({ drawing, onClose }: DrawingLightboxProps) {
  useEffect(() => {
    if (!drawing) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawing, onClose]);

  if (!drawing) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${drawing.name}'s drawing`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl space-y-4 rounded-3xl bg-white p-4 sm:p-6"
      >
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-ink/10">
          <StrokePreview strokes={drawing.strokes ?? []} label={`${drawing.name}'s drawing`} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold">{drawing.name}</p>
            {drawing.caption && <p className="text-muted">{drawing.caption}</p>}
          </div>

          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
