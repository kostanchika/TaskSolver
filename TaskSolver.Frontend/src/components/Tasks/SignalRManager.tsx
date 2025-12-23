import { useSignalR } from "../../hooks/useSignalR";

interface SignalRManagerProps {
  onSolutionCompleted: (solutionId: string) => void;
}

export const SignalRManager: React.FC<SignalRManagerProps> = ({
  onSolutionCompleted,
}) => {
  const hubUrl = `${import.meta.env.VITE_API_URL}/solutionsHub`;

  const { isConnected, isConnecting } = useSignalR({
    url: hubUrl,
    onSolutionCompleted,
  });

  // Просто рендерим статус подключения
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected
            ? "bg-green-400"
            : isConnecting
            ? "bg-yellow-400"
            : "bg-red-400"
        }`}
      ></div>
      <span className="text-xs text-gray-400">
        {isConnected
          ? "Подключено"
          : isConnecting
          ? "Подключение..."
          : "Отключено"}
      </span>
    </div>
  );
};
