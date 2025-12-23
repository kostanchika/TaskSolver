// /src/components/tasks/TaskRating.tsx
import { useState, useEffect, useCallback } from "react";
import { marksApi } from "../../api/marks/marks";
import { MarkStatistics } from "../../api/marks/types";

interface TaskRatingProps {
  taskId: string;
  onRatingUpdate?: (stats: MarkStatistics & { average: number }) => void;
}

interface EnhancedStatistics extends MarkStatistics {
  average: number;
}

// Вариант 1: Бинарные индикаторы (как биты)
const BinaryRating = ({
  rating,
  onRatingChange,
  readonly,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
        <button
          key={value}
          onClick={() => !readonly && onRatingChange?.(value)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            border-2 rounded-lg transition-all duration-200 font-mono font-bold
            ${
              value <= rating
                ? "bg-emerald-500 border-emerald-400 text-white scale-100"
                : "bg-[#2d2d2d] border-[#333333] text-gray-400 scale-90"
            }
            ${
              !readonly &&
              "hover:scale-105 hover:border-emerald-300 cursor-pointer"
            }
            disabled:cursor-default
          `}
        >
          {value <= rating ? "1" : "0"}
        </button>
      ))}
    </div>
  );
};

// Вариант 2: Шестнадцатеричные индикаторы
const HexRating = ({
  rating,
  onRatingChange,
  readonly,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const hexValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A"];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
        <button
          key={value}
          onClick={() => !readonly && onRatingChange?.(value)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            border-2 rounded-lg font-mono font-bold transition-all duration-200
            ${
              value <= rating
                ? "bg-[#e85353] border-[#e85353] text-white scale-100"
                : "bg-[#2d2d2d] border-[#333333] text-gray-400 scale-90"
            }
            ${
              !readonly &&
              "hover:scale-105 hover:border-[#d64242] cursor-pointer"
            }
            disabled:cursor-default
          `}
        >
          {hexValues[value]}
        </button>
      ))}
    </div>
  );
};

// Вариант 3: Индикаторы сложности (как в Codewars)
const DifficultyRating = ({
  rating,
  onRatingChange,
  readonly,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-3 h-4",
    md: "w-4 h-6",
    lg: "w-5 h-8",
  };

  const getColor = (value: number) => {
    if (value <= 3) return "bg-emerald-500";
    if (value <= 6) return "bg-yellow-500";
    if (value <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex gap-1 items-end">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
        <button
          key={value}
          onClick={() => !readonly && onRatingChange?.(value)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            rounded-t transition-all duration-300
            ${
              value <= rating
                ? `${getColor(value)} scale-100`
                : "bg-[#2d2d2d] scale-90"
            }
            ${!readonly && "hover:scale-105 cursor-pointer"}
            disabled:cursor-default
          `}
          style={{
            height: `${value * (size === "sm" ? 3 : size === "md" ? 4 : 5)}px`,
          }}
        />
      ))}
    </div>
  );
};

// Вариант 4: Терминальные индикаторы
const TerminalRating = ({
  rating,
  onRatingChange,
  readonly,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-6 h-2 text-xs",
    md: "w-8 h-3 text-sm",
    lg: "w-10 h-4 text-base",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
        <button
          key={value}
          onClick={() => !readonly && onRatingChange?.(value)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            rounded-lg font-mono transition-all duration-200 border
            ${
              value <= rating
                ? "bg-emerald-400 border-emerald-300 scale-100"
                : "bg-[#2d2d2d] border-[#333333] scale-90"
            }
            ${
              !readonly &&
              "hover:scale-105 hover:border-emerald-200 cursor-pointer"
            }
            disabled:cursor-default
          `}
        >
          {value <= rating && (
            <div className="w-full h-full bg-emerald-400 rounded-lg animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export const TaskRating = ({ taskId, onRatingUpdate }: TaskRatingProps) => {
  const [statistics, setStatistics] = useState<EnhancedStatistics | null>(null);
  const [ratingStyle] = useState<"binary" | "hex" | "difficulty" | "terminal">(
    "difficulty"
  );
  const [isLoading, setIsLoading] = useState(true);

  const calculateAverage = (stats: MarkStatistics): number =>
    stats.totalCount > 0 ? stats.marksSum / stats.totalCount : 0;

  const enhanceStatistics = (stats: MarkStatistics): EnhancedStatistics => ({
    ...stats,
    average: calculateAverage(stats),
  });

  const loadStatistics =
    useCallback(async (): Promise<EnhancedStatistics | null> => {
      try {
        setIsLoading(true);
        const response = await marksApi.getAllByTaskId(taskId);
        const enhancedStats = enhanceStatistics(response.data);

        setStatistics(enhancedStats);
        onRatingUpdate?.(enhancedStats);

        return enhancedStats;
      } catch (error) {
        console.error("Ошибка загрузки оценок:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [taskId, onRatingUpdate]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const updateStatisticsOptimistically = (
    currentStats: EnhancedStatistics,
    newUserMark: number | null
  ): EnhancedStatistics => {
    const oldUserMark = currentStats.userMark ?? 0;
    const isNewRating = currentStats.userMark === null && newUserMark !== null;
    const isRemovingRating =
      currentStats.userMark !== null && newUserMark === null;

    let newMarksSum = currentStats.marksSum;
    let newTotalCount = currentStats.totalCount;

    if (isNewRating && newUserMark !== null) {
      newMarksSum += newUserMark;
      newTotalCount += 1;
    } else if (isRemovingRating) {
      newMarksSum -= oldUserMark;
      newTotalCount -= 1;
    } else if (newUserMark !== null) {
      newMarksSum = currentStats.marksSum - oldUserMark + newUserMark;
    }

    return {
      ...currentStats,
      userMark: newUserMark,
      marksSum: newMarksSum,
      totalCount: newTotalCount,
      average: newTotalCount > 0 ? newMarksSum / newTotalCount : 0,
    };
  };

  const handleRatingOperation = async (
    operation: () => Promise<void>,
    newUserMark: number | null
  ) => {
    if (!statistics) return;

    const oldStatistics = statistics;
    const newStatistics = updateStatisticsOptimistically(
      oldStatistics,
      newUserMark
    );

    setStatistics(newStatistics);
    onRatingUpdate?.(newStatistics);

    operation().catch((error) => {
      console.error("Ошибка оценки:", error);
      loadStatistics();
    });
  };

  const handleRatingChange = (rating: number) =>
    handleRatingOperation(() => marksApi.upsert(taskId, rating), rating);

  const handleRemoveRating = () =>
    handleRatingOperation(() => marksApi.delete(taskId), null);

  const renderSkeleton = () => (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] animate-pulse">
      <div className="h-4 bg-[#2d2d2d] rounded-lg w-1/3 mb-4"></div>
      <div className="h-6 bg-[#2d2d2d] rounded-lg mb-2"></div>
      <div className="h-4 bg-[#2d2d2d] rounded-lg w-1/2"></div>
    </div>
  );

  const getRatingLabel = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "оценок";
    if (lastDigit === 1) return "оценка";
    if (lastDigit >= 2 && lastDigit <= 4) return "оценки";
    return "оценок";
  };

  const renderRatingComponent = () => {
    const props = {
      rating: hasUserRating ? userMark! : Math.round(average),
      onRatingChange: handleRatingChange,
      readonly: false,
      size: "md" as const,
    };

    switch (ratingStyle) {
      case "binary":
        return <BinaryRating {...props} />;
      case "hex":
        return <HexRating {...props} />;
      case "difficulty":
        return <DifficultyRating {...props} />;
      case "terminal":
        return <TerminalRating {...props} />;
      default:
        return <DifficultyRating {...props} />;
    }
  };

  if (isLoading || !statistics) return renderSkeleton();

  const { average, totalCount, userMark } = statistics;
  const hasUserRating = userMark !== null;

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-300 font-mono">
          Оценка задачи
        </div>
        <div className="flex gap-2">
          {hasUserRating && (
            <button
              onClick={handleRemoveRating}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors font-mono"
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white font-mono">
            {average.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {totalCount} {getRatingLabel(totalCount)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-3">
          {renderRatingComponent()}

          {hasUserRating && (
            <div className="text-sm font-medium text-emerald-400 font-mono">
              Ваша оценка: {userMark}/10
            </div>
          )}
        </div>
      </div>

      {!hasUserRating && (
        <div className="mt-4 text-xs text-gray-400 font-mono text-center">
          Нажмите на индикаторы для оценки
        </div>
      )}
    </div>
  );
};
