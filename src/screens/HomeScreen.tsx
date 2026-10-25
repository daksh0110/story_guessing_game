import { useState, type FormEvent } from "react";
import { useSession } from "@/hooks/useSession";
import { navigateTo } from "@/hooks/useHashRoute";
import { validateUsername } from "@/utils/validation";
import { USERNAME_MAX_LENGTH } from "@/constants/game";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";

const HOW_IT_WORKS = [
  "Artists each get one secret scene card and draw only that.",
  "Guessers watch the comic come together, without any prompts.",
  "Everyone reveals the scenes and compares them to the story they guessed.",
];

export default function HomeScreen() {
  const { username, setUsername } = useSession();
  const [draftName, setDraftName] = useState(username);
  const [error, setError] = useState<string | null>(null);

  const continueTo = (path: string) => {
    const validationError = validateUsername(draftName);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUsername(draftName);
    navigateTo(path);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    continueTo("/create");
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <section className="space-y-6">
        <p className="inline-flex rounded-full bg-sun px-3 py-1 text-sm font-semibold">
          A party game for drawers and detectives
        </p>

        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          Draw the story. Crack the story.
        </h1>

        <p className="max-w-prose text-lg text-muted">
          Teams work from hidden fragments of one story. Artists draw their piece blind,
          and guessers piece the whole thing together from the drawings alone.
        </p>

        <ol className="space-y-3">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal font-semibold text-white">
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Who's playing?</h2>
            <p className="text-sm text-muted">Pick a name your friends will recognize.</p>
          </div>

          <TextField
            label="Your name"
            name="username"
            autoComplete="nickname"
            placeholder="e.g. Pixel Pirate"
            maxLength={USERNAME_MAX_LENGTH}
            value={draftName}
            error={error}
            onChange={(event) => {
              setDraftName(event.target.value);
              setError(null);
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="submit" block>
              Create a lobby
            </Button>

            <Button variant="secondary" block onClick={() => continueTo("/join")}>
              Join a lobby
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
