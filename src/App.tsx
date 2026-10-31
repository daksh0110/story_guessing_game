import { useEffect } from "react";
import { navigateTo, useHashRoute, type Route } from "@/hooks/useHashRoute";
import SessionProvider from "@/context/SessionProvider";
import AppLayout from "@/components/layout/AppLayout";
import StatusCard from "@/components/layout/StatusCard";
import Button from "@/components/ui/Button";
import HomeScreen from "@/screens/HomeScreen";
import CreateLobbyScreen from "@/screens/CreateLobbyScreen";
import JoinLobbyScreen from "@/screens/JoinLobbyScreen";
import LobbyScreen from "@/screens/LobbyScreen";
import GameScreen from "@/screens/GameScreen";
import { socket } from "@/utils/socket";
import { refreshRoomFromBackend } from "@/services/roomService";
import { useAppDispatch } from "@/store";
import {
  playerJoined,
  playerLeft,
  setSocketConnected,
  setSocketId,
} from "@/store/slices/gameSlice";
import type { PlayerData } from "@/types/api";

function RouteScreen({ route }: { route: Route }) {
  switch (route.name) {
    case "home":
      return <HomeScreen />;
    case "create":
      return <CreateLobbyScreen />;
    case "join":
      return <JoinLobbyScreen initialCode={route.code} />;
    case "lobby":
      return <LobbyScreen code={route.code} />;
    case "game":
      return <GameScreen code={route.code} />;
    case "notFound":
      return (
        <StatusCard
          title="Page not found"
          description="That link doesn't lead anywhere."
        >
          <Button onClick={() => navigateTo("/")}>Go to home</Button>
        </StatusCard>
      );
  }
}

export default function App() {
  const route = useHashRoute();
  const dispatch = useAppDispatch();

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      dispatch(setSocketConnected(true));
      dispatch(setSocketId(socket.id ?? null));

      socket.emit(
        "client.ping",
        { message: "Hello from frontend" },
        (response: { event: string; server_time: string }) => {
          console.log("Socket connected, ping response:", response);
        },
      );
    });

    socket.on("disconnect", () => {
      dispatch(setSocketConnected(false));
      dispatch(setSocketId(null));
    });

    socket.on("connect_error", (error) => {
      console.error("Connection failed:", error.message);
      dispatch(setSocketConnected(false));
    });

    socket.on(
      "room.player_joined",
      (data: { player: PlayerData; room_code: string }) => {
        console.log(data);
        if (data?.player) {
          dispatch(playerJoined(data.player));
        }
        if (data?.room_code) {
          refreshRoomFromBackend(data.room_code);
        }
      },
    );

    socket.on(
      "room.player_left",
      (data: { player_id: number; name: string; room_code: string }) => {
        if (data?.player_id) {
          dispatch(playerLeft({ player_id: data.player_id }));
        }
        if (data?.room_code) {
          refreshRoomFromBackend(data.room_code);
        }
      },
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("room.player_joined");
      socket.off("room.player_left");
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <SessionProvider>
      <AppLayout>
        <RouteScreen route={route} />
      </AppLayout>
    </SessionProvider>
  );
}
