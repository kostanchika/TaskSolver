// /src/components/matchmaking/QueueTimer.tsx
import { useState, useEffect } from "react";

interface QueueTimerProps {
  waitingTime?: string;
}

export const QueueTimer = ({ waitingTime }: QueueTimerProps) => {
  const [formattedTime, setFormattedTime] = useState<string>("0 сек");

  useEffect(() => {
    if (!waitingTime) {
      setFormattedTime("0 сек");
      return;
    }

    const parseWaitingTime = (timeStr: string): number => {
      try {
        const parts = timeStr.split(":");
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const secondsWithMs = parts[2].split(".");
          const seconds = parseInt(secondsWithMs[0], 10);
          return hours * 3600 + minutes * 60 + seconds;
        }
        return 0;
      } catch {
        return 0;
      }
    };

    const startTime = Date.now();
    const initialSeconds = parseWaitingTime(waitingTime);

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const totalSeconds = initialSeconds + elapsedSeconds;

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes === 0) {
        setFormattedTime(`${seconds} сек`);
      } else {
        setFormattedTime(`${minutes} мин ${seconds} сек`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [waitingTime]);

  return <>{formattedTime}</>;
};
