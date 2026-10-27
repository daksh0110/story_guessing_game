import { useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import copyIcon from "@/assets/svgs/icon-copy.svg";

type RoomCodeBadgeProps = {
  code: string;
};

export default function RoomCodeBadge({ code }: RoomCodeBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}#/join/${code}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access is blocked on some non-secure (LAN) origins. The code is still on screen.
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Room code</p>
        <p
          aria-label={`Room code ${code.split("").join(" ")}`}
          className="font-display text-4xl font-bold tracking-[0.25em] sm:text-5xl"
        >
          {code}
        </p>
      </div>

      <Button variant="ghost" onClick={copyInviteLink}>
        <Icon src={copyIcon} />
        {copied ? "Link copied" : "Copy invite link"}
      </Button>
    </div>
  );
}
