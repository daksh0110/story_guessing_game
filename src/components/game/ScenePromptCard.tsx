type ScenePromptCardProps = {
  /** The artist's private scene card. Omit it for guessers. */
  prompt?: string;
};

export default function ScenePromptCard({ prompt }: ScenePromptCardProps) {
  return (
    <div className="flex-1 rounded-2xl bg-sun p-5">
      <p className="text-xs font-bold uppercase tracking-widest">
        {prompt ? "Your secret scene" : "Guessers"}
      </p>
      <p className="font-display text-xl font-semibold sm:text-2xl">
        {prompt ?? "Watch the comic take shape, then rebuild the whole story."}
      </p>
    </div>
  );
}
