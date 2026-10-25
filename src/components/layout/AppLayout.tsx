import type { ReactNode } from "react";
import { useSession } from "@/hooks/useSession";
import { navigateTo } from "@/hooks/useHashRoute";
import logoIcon from "@/assets/svgs/logo.svg";
import Icon from "@/components/ui/Icon";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { username } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigateTo("/")}
          className="flex items-center gap-2 rounded-xl focus-visible:outline-3 focus-visible:outline-teal"
        >
          <Icon src={logoIcon} alt="StoryFrames home" className="h-9 w-9" />
          <span className="font-display text-xl font-bold">StoryFrames</span>
        </button>

        {username && (
          <span className="max-w-[10rem] truncate rounded-full bg-white px-3 py-1.5 text-sm font-semibold shadow-sm sm:max-w-xs">
            Playing as {username}
          </span>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-2 sm:px-6 sm:pt-6">
        {children}
      </main>
    </div>
  );
}
