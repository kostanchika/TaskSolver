// /src/components/tasks/SolutionHistory.tsx
import { useState, useEffect } from "react";
import { SolutionDto } from "../../api/solutions/types";
import { ProgrammingLanguageDto } from "../../api/programming-languages/types";
import { solutionsApi } from "../../api/solutions/solutions";
import { useSignalR } from "../../hooks/useSignalR";

interface SolutionHistoryProps {
  taskId: string;
  languages: ProgrammingLanguageDto[];
  onTaskSolved: () => void;
}

export const SolutionHistory: React.FC<SolutionHistoryProps> = ({
  taskId,
  languages,
  onTaskSolved,
}) => {
  const [solutions, setSolutions] = useState<SolutionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<SolutionDto | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSolutions();
  }, [taskId]);

  const hubUrl = `${import.meta.env.VITE_API_URL}/solutionsHub`;
  useSignalR({
    url: hubUrl,
    onSolutionCompleted: () => loadSolutions(),
  });

  const loadSolutions = async () => {
    try {
      setLoading(true);
      const response = await solutionsApi.getAllByTaskId(taskId);
      setSolutions(response.data);

      if (response.data.every((s) => s.results.every((r) => r.isSovled))) {
        onTaskSolved();
      }
    } catch {
      setError("Не удалось загрузить историю решений");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (languageId: string) => {
    const lang = languages.find((l) => l.id === languageId);
    return lang ? `${lang.name} ${lang.version}` : languageId;
  };

  // Определяем статус решения
  const getSolutionStatus = (solution: SolutionDto) => {
    if (!solution.completedAt) return "running";
    if (solution.results.every((result) => result.isSovled)) return "success";
    return "failed";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-[#e85353]";
      case "failed":
        return "text-[#ff6b6b]";
      case "running":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Решено";
      case "failed":
        return "Ошибка";
      case "running":
        return "Выполняется";
      default:
        return "Неизвестно";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU");
  };

  // Подсчет пройденных тестов
  const getTestStats = (solution: SolutionDto) => {
    const passedTests = solution.results.filter(
      (result) => result.isSovled
    ).length;
    const publicTests = solution.results.filter((result) => result.isPublic);
    const privateTests = solution.results.filter((result) => !result.isPublic);
    const passedPublic = publicTests.filter((result) => result.isSovled).length;
    const passedPrivate = privateTests.filter(
      (result) => result.isSovled
    ).length;

    return {
      total: solution.results.length,
      passed: passedTests,
      public: publicTests.length,
      private: privateTests.length,
      passedPublic,
      passedPrivate,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85353]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#e85353] mb-4">{error}</p>
        <button
          onClick={loadSolutions}
          className="px-4 py-2 bg-[#e85353] text-white rounded-md hover:bg-[#ff6b6b] transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Пока нет отправленных решений</p>
        <p className="text-sm text-gray-500 mt-2">
          Станьте первым, кто отправит решение этой задачи!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Модальное окно с деталями тестов */}
      {selectedSolution && showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border border-[#333333]">
            <div className="flex items-center justify-between p-6 border-b border-[#333333]">
              <h3 className="text-lg font-semibold text-white">
                Детали решения от {formatDate(selectedSolution.createdAt)}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-[#e85353] transition-colors p-1 rounded-full hover:bg-[#333333] w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Язык:</span>
                    <span className="text-gray-300 ml-2">
                      {getLanguageName(selectedSolution.languageId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Статус:</span>
                    <span
                      className={`ml-2 ${getStatusColor(
                        getSolutionStatus(selectedSolution)
                      )}`}
                    >
                      {getStatusText(getSolutionStatus(selectedSolution))}
                    </span>
                  </div>
                </div>

                {/* Детали тестов */}
                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">
                    Результаты тестов:
                  </h4>
                  <div className="space-y-3">
                    {selectedSolution.results.map((result, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          result.isSovled
                            ? "border-[#e85353]/30 bg-[#e85353]/10"
                            : "border-[#ff6b6b]/30 bg-[#ff6b6b]/10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                result.isSovled
                                  ? "bg-[#e85353]"
                                  : "bg-[#ff6b6b]"
                              }`}
                            ></div>
                            <span className="text-gray-300 font-medium">
                              Тест {index + 1} {!result.isPublic && "(скрытый)"}
                            </span>
                          </div>
                          <span
                            className={`text-sm ${
                              result.isSovled
                                ? "text-[#e85353]"
                                : "text-[#ff6b6b]"
                            }`}
                          >
                            {result.isSovled ? "Пройден" : "Не пройден"}
                          </span>
                        </div>

                        {/* Детали для публичных тестов */}
                        {result.isPublic ? (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-400">Ввод:</span>
                              <pre className="text-gray-300 mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]">
                                {result.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-gray-400">Вывод:</span>
                              <pre className="text-gray-300 mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]">
                                {result.stdout}
                              </pre>
                            </div>
                            {result.stderr && (
                              <div>
                                <span className="text-gray-400">Ошибка:</span>
                                <pre className="text-[#ff6b6b] mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]">
                                  {result.stderr}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            {result.isSovled
                              ? "Скрытый тест пройден"
                              : "Скрытый тест не пройден"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Код решения */}
                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">
                    Код решения:
                  </h4>
                  <pre className="bg-[#333333] p-4 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap border border-[#3a3a3a]">
                    {selectedSolution.code}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список решений */}
      <div className="space-y-3">
        {solutions.map((solution) => {
          const status = getSolutionStatus(solution);
          const stats = getTestStats(solution);

          return (
            <div
              key={solution.id}
              className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#333333] transition-colors cursor-pointer border border-[#333333] hover:border-[#3a3a3a]"
              onClick={() => {
                setSelectedSolution(solution);
                setShowDetails(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === "success"
                        ? "bg-[#e85353]/20 text-[#e85353] border border-[#e85353]/30"
                        : status === "failed"
                        ? "bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {getStatusText(status)}
                  </div>
                  <span className="text-gray-300 text-sm">
                    {getLanguageName(solution.languageId)}
                  </span>

                  {/* Статистика тестов */}
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>
                      Тесты: {stats.passed}/{stats.total}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">
                    {formatDate(solution.createdAt)}
                  </span>
                  {solution.completedAt && (
                    <span className="text-gray-500 text-sm">завершено</span>
                  )}
                </div>
              </div>

              {/* Прогресс-бар */}
              {solution.results.length !== 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Прогресс тестов</span>
                    <span>
                      {Math.round((stats.passed / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#333333] rounded-full h-2">
                    <div
                      className="bg-[#e85353] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stats.passed / stats.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
