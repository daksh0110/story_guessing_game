import { useEffect, useMemo, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "create" }
  | { name: "join"; code: string }
  | { name: "lobby"; code: string }
  | { name: "game"; code: string }
  | { name: "notFound" };

/** Parses `#/lobby/ABCD`-style hashes. Hash routing needs no server setup. */
export function parseRoute(hash: string): Route {
  const [head, code = ""] = hash.replace(/^#/, "").split("/").filter(Boolean);

  switch (head) {
    case undefined:
      return { name: "home" };
    case "create":
      return { name: "create" };
    case "join":
      return { name: "join", code: code.toUpperCase() };
    case "lobby":
      return code ? { name: "lobby", code: code.toUpperCase() } : { name: "notFound" };
    case "game":
      return code ? { name: "game", code: code.toUpperCase() } : { name: "notFound" };
    default:
      return { name: "notFound" };
  }
}

export function navigateTo(path: string) {
  window.location.hash = path;
}

export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return useMemo(() => parseRoute(hash), [hash]);
}
