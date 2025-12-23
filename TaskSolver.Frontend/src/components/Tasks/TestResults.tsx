// /src/components/tasks/TestResults.tsx
interface TestResultsProps {
  results: {
    total: number;
    passed: number;
    failed: number;
    executionTime: number;
    memoryUsed: number;
    details: Array<{
      testId: string;
      status: string;
      executionTime: number;
      memoryUsed: number;
    }>;
  };
}

export const TestResults: React.FC<TestResultsProps> = ({ results }) => {
  const formatMemory = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white font-mono">
          Результаты тестов
        </h3>
        <div className="text-sm text-gray-400 font-mono">
          {formatTime(results.executionTime)} •{" "}
          {formatMemory(results.memoryUsed)}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333]">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {results.passed}
            </div>
            <div className="text-sm text-gray-400 font-mono">Пройдено</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400 font-mono">
              {results.failed}
            </div>
            <div className="text-sm text-gray-400 font-mono">Не пройдено</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 font-mono">
              {results.total}
            </div>
            <div className="text-sm text-gray-400 font-mono">Всего</div>
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="space-y-3">
        {results.details.map((test, index) => (
          <div
            key={test.testId}
            className={`p-4 rounded-xl flex items-center justify-between border transition-all duration-200 ${
              test.status === "success"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  test.status === "success" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="font-medium text-white font-mono">
                Тест #{index + 1}
              </span>
            </div>
            <div className="text-sm text-gray-400 font-mono">
              {formatTime(test.executionTime)} • {formatMemory(test.memoryUsed)}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Result */}
      <div
        className={`p-4 rounded-xl border text-center font-mono ${
          results.passed === results.total
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        {results.passed === results.total ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Все тесты пройдены успешно!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5"
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
            <span>
              Пройдено {results.passed} из {results.total} тестов
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
