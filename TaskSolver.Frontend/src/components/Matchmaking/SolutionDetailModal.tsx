// components/matchmaking/SolutionDetailsModal.tsx
import { SolutionDto } from "../../api/solutions/types";
import { ProgrammingLanguageDto } from "../../api/programming-languages/types";

interface SolutionDetailsModalProps {
  solution: SolutionDto;
  languages: ProgrammingLanguageDto[];
  onClose: () => void;
}

export const SolutionDetailsModal: React.FC<SolutionDetailsModalProps> = ({
  solution,
  languages,
  onClose,
}) => {
  const getLanguageName = (languageId: string) => {
    const lang = languages.find((l) => l.id === languageId);
    return lang ? `${lang.name} ${lang.version}` : languageId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Подсчет результатов тестов
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
      percentage:
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      publicTests: publicTests.length,
      privateTests: privateTests.length,
      passedPublic,
      passedPrivate,
    };
  };

  const stats = getTestStats();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-xl border border-[#333333] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333333]">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">
              Детали решения
            </h2>
            <p className="text-gray-400 text-sm font-mono">
              Отправлено: {formatDate(solution.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Общая информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2d2d2d] p-4 rounded-lg">
                <h4 className="text-gray-400 text-sm font-mono mb-2">Язык</h4>
                <p className="text-white font-mono">
                  {getLanguageName(solution.languageId)}
                </p>
              </div>
              <div className="bg-[#2d2d2d] p-4 rounded-lg">
                <h4 className="text-gray-400 text-sm font-mono mb-2">Статус</h4>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full font-mono ${
                    stats.passed === stats.total
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stats.passed === stats.total ? "Зачтено" : "Ошибка"}(
                  {stats.passed}/{stats.total} тестов)
                </div>
              </div>
            </div>

            {/* Прогресс тестов */}
            <div className="bg-[#2d2d2d] p-4 rounded-lg">
              <h4 className="text-gray-400 text-sm font-mono mb-3">
                Результаты тестов
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-300">Общий прогресс</span>
                  <span className="text-gray-400">{stats.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-[#333333] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stats.passed === stats.total
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-400">Публичные:</span>
                    <span className="text-gray-300">
                      {stats.passedPublic}/{stats.publicTests}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-400">Скрытые:</span>
                    <span className="text-gray-300">
                      {stats.passedPrivate}/{stats.privateTests}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Детали тестов */}
            <div className="space-y-4">
              <h4 className="text-white font-mono font-medium">
                Детали тестов
              </h4>
              {solution.results.map((test, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    test.isSovled
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono ${
                          test.isSovled
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-white font-mono">
                          Тест {index + 1}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              test.isPublic
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {test.isPublic ? "Публичный" : "Скрытый"}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              test.isSovled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {test.isSovled ? "Пройден" : "Не пройден"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Детали теста */}
                  <div className="space-y-3">
                    {test.isPublic && test.input && (
                      <div>
                        <h6 className="text-gray-400 text-sm font-mono mb-1">
                          Входные данные:
                        </h6>
                        <pre className="bg-[#333333] p-3 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                          {test.input}
                        </pre>
                      </div>
                    )}

                    {test.stdout && (
                      <div>
                        <h6 className="text-gray-400 text-sm font-mono mb-1">
                          Вывод программы:
                        </h6>
                        <pre className="bg-[#333333] p-3 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                          {test.stdout}
                        </pre>
                      </div>
                    )}

                    {test.stderr && (
                      <div>
                        <h6 className="text-gray-400 text-sm font-mono mb-1">
                          Ошибки:
                        </h6>
                        <pre className="bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-red-400 overflow-x-auto whitespace-pre-wrap font-mono">
                          {test.stderr}
                        </pre>
                      </div>
                    )}

                    {!test.isPublic && (
                      <div className="text-center py-2">
                        <span className="text-gray-500 text-sm font-mono">
                          {test.isSovled
                            ? "Скрытый тест пройден"
                            : "Скрытый тест не пройден"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Исходный код */}
            <div>
              <h4 className="text-white font-mono font-medium mb-3">
                Исходный код
              </h4>
              <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#333333]">
                <div className="bg-[#2d2d2d] px-4 py-3 border-b border-[#333333]">
                  <span className="text-gray-400 text-sm font-mono">
                    solution.js
                  </span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto max-h-96 font-mono">
                  {solution.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
