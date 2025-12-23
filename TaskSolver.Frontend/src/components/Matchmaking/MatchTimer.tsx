// /src/components/matchmaking/MatchTimer.tsx
import { useState, useEffect } from "react";

interface MatchTimerProps {
  endsAt: string;
  startedAt: string;
}

export const MatchTimer = ({ endsAt }: MatchTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("00:00");

  useEffect(() => {
    const updateTime = () => {
      const endsAtDate = new Date(endsAt);
      const now = new Date();
      const diffMs = endsAtDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return <span className="text-white font-bold">{timeLeft}</span>;
};
