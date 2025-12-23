// /src/hooks/useSignalR.ts - УПРОЩЕННАЯ ВЕРСИЯ (ИСПРАВЛЕННАЯ)
import { useState, useEffect, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { QueueInfoDto } from "../api/matchmaking/types";

interface UseSignalRProps {
  url: string;
  onSolutionCompleted?: (solutionId: string) => void;
  onQueueUpdated?: (info: QueueInfoDto) => void;
  onMatchStarted?: (matchId: string) => void;
  onMatchUpdated?: () => void;
}

export const useSignalR = ({
  url,
  onSolutionCompleted,
  onQueueUpdated,
  onMatchStarted,
  onMatchUpdated,
}: UseSignalRProps) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);
  const isMountedRef = useRef(true);

  // Сохраняем обработчики в ref
  const handlersRef = useRef({
    onSolutionCompleted,
    onQueueUpdated,
    onMatchStarted,
    onMatchUpdated,
  });

  useEffect(() => {
    handlersRef.current = {
      onSolutionCompleted,
      onQueueUpdated,
      onMatchStarted,
      onMatchUpdated,
    };
  }, [onSolutionCompleted, onQueueUpdated, onMatchStarted, onMatchUpdated]);

  useEffect(() => {
    isMountedRef.current = true;

    const connect = async () => {
      if (connectionRef.current || isConnecting) {
        return;
      }

      try {
        setIsConnecting(true);

        const hubConnection = new HubConnectionBuilder()
          .withUrl(url, {
            accessTokenFactory: () => localStorage.getItem("accessToken") || "",
          })
          .configureLogging(LogLevel.Warning)
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              return Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                30000
              );
            },
          })
          .build();

        // НАСТРОЙКА ОБРАБОТЧИКОВ - регистрируем в lowercase
        // Также регистрируем в разных регистрах для совместимости

        // 1. SolutionCompleted
        const solutionHandler = (solutionId: string) => {
          if (isMountedRef.current && handlersRef.current.onSolutionCompleted) {
            console.log("SolutionCompleted event received:", solutionId);
            handlersRef.current.onSolutionCompleted(solutionId);
          }
        };
        hubConnection.on("SolutionCompleted", solutionHandler);
        hubConnection.on("solutioncompleted", solutionHandler);

        // 2. QueueUpdated
        const queueHandler = (info: QueueInfoDto) => {
          if (isMountedRef.current && handlersRef.current.onQueueUpdated) {
            console.log("QueueUpdated event received:", info);
            handlersRef.current.onQueueUpdated(info);
          }
        };
        hubConnection.on("QueueUpdated", queueHandler);
        hubConnection.on("queueupdated", queueHandler);

        // 3. MatchStarted
        const matchStartedHandler = (matchId: string) => {
          if (isMountedRef.current && handlersRef.current.onMatchStarted) {
            console.log("MatchStarted event received:", matchId);
            handlersRef.current.onMatchStarted(matchId);
          }
        };
        hubConnection.on("MatchStarted", matchStartedHandler);
        hubConnection.on("matchstarted", matchStartedHandler);

        // 4. MatchUpdated
        const matchUpdatedHandler = () => {
          if (isMountedRef.current && handlersRef.current.onMatchUpdated) {
            console.log("MatchUpdated event received:");
            handlersRef.current.onMatchUpdated();
          }
        };
        hubConnection.on("MatchUpdated", matchUpdatedHandler);
        hubConnection.on("matchupdated", matchUpdatedHandler);

        // Дополнительно: логируем все события для отладки
        hubConnection.on("*", (method, ...args) => {
          console.log(`All SignalR event: ${method}`, args);
        });

        hubConnection.onreconnecting(() => {
          if (isMountedRef.current) {
            console.log("SignalR reconnecting...");
            setIsConnected(false);
          }
        });

        hubConnection.onreconnected(() => {
          if (isMountedRef.current) {
            console.log("SignalR reconnected");
            setIsConnected(true);
          }
        });

        hubConnection.onclose(() => {
          if (isMountedRef.current) {
            console.log("SignalR connection closed");
            setIsConnected(false);
          }
        });

        await hubConnection.start();
        console.log("SignalR connected successfully");

        if (isMountedRef.current) {
          setConnection(hubConnection);
          connectionRef.current = hubConnection;
          setIsConnected(true);
        }
      } catch (error) {
        console.error("SignalR connection failed:", error);
        if (isMountedRef.current) {
          setIsConnected(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsConnecting(false);
        }
      }
    };

    connect();

    return () => {
      isMountedRef.current = false;

      if (connectionRef.current) {
        console.log("Cleaning up SignalR connection");
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
      }
    };
  }, [url]); // Зависим только от URL и accessToken

  return { connection, isConnected, isConnecting };
};
