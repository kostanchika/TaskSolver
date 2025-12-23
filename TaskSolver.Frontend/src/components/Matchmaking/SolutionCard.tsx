// components/matchmaking/SolutionCard.tsx
import { SolutionDto } from "../../api/solutions/types";
import { ProgrammingLanguageDto } from "../../api/programming-languages/types";

interface SolutionCardProps {
  solution: SolutionDto;
  index: number;
  languages: ProgrammingLanguageDto[];
  onViewDetails: (solution: SolutionDto) => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  index,
  languages,
  onViewDetails,
}) => {
  const getLanguageName = (languageId: string) => {
    const lang = languages.find((l) => l.id === languageId);
    return lang ? `${lang.name} ${lang.version}` : languageId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Подсчет пройденных тестов
  const getTestStats = () => {
    const passedTests = solution.results.filter((r) => r.isSovled).length;
    const totalTests = solution.results.length;
    const publicTests = solution.results.filter((r) => r.isPublic);
    const privateTests = solution.results.filter((r) => !r.isPublic);
    const passedPublic = publicTests.filter((r) => r.isSovled).length;
    const passedPrivate = privateTests.filter((r) => r.isSovled).length;

    return {
      total: totalTests,
      passed: passedTests,
      public: publicTests.length,
      private: privateTests.length,
      passedPublic,
      passedPrivate,
      percentage:
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
    };
  };

  const stats = getTestStats();
  const isSuccess = solution.completedAt && stats.passed === stats.total;
  const isFailed = solution.completedAt && stats.passed < stats.total;
  const isRunning = !solution.completedAt;

  return (
    <div
      className="bg-[#2d2d2d] rounded-lg border border-[#333333] p-4 hover:border-[#3a3a3a] transition-colors cursor-pointer"
      onClick={() => onViewDetails(solution)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold ${
              isSuccess
                ? "bg-green-500/20 text-green-400"
                : isFailed
                ? "bg-red-500/20 text-red-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {index + 1}
          </div>
          <div>
            <h4 className="text-white font-mono font-medium">
              Решение от {formatDate(solution.createdAt)}
            </h4>
            <p className="text-gray-400 text-sm font-mono">
              {getLanguageName(solution.languageId)}
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-sm font-mono ${
            isSuccess
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : isFailed
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {isRunning ? "Выполняется..." : isSuccess ? "Зачтено" : "Ошибка"}
        </div>
      </div>

      {/* Прогресс тестов */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-mono">
          <span>Прогресс тестов</span>
          <span>
            {stats.passed}/{stats.total} ({stats.percentage}%)
          </span>
        </div>
        <div className="w-full h-2 bg-[#333333] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isSuccess
                ? "bg-green-500"
                : isFailed
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>

        {/* Детали тестов */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Публичные:</span>
            <span className="text-gray-300">
              {stats.passedPublic}/{stats.public}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-gray-400">Скрытые:</span>
            <span className="text-gray-300">
              {stats.passedPrivate}/{stats.private}
            </span>
          </div>
        </div>
      </div>

      {/* Краткий код */}
      <div className="mt-3 pt-3 border-t border-[#333333]">
        <pre className="text-xs text-gray-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
          {solution.code.substring(0, 150)}...
        </pre>
      </div>
    </div>
  );
};
