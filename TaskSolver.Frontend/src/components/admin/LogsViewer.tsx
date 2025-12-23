import React, { useState, useEffect, useRef, useMemo } from "react";
import { solutionsApi } from "../../api/statistics/statistics";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  raw: string;
  index: number;
  isMultiLine: boolean;
}

export const LogsViewer: React.FC = () => {
  const [rawLogs, setRawLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState({
    level: "all",
    search: "",
    autoRefresh: false,
  });
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
  const [pageSize, setPageSize] = useState(1000);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const logEntries = useMemo(() => {
    if (!rawLogs.trim()) return [];

    const lines = rawLogs.split("\n");
    const entries: LogEntry[] = [];
    let currentEntry: LogEntry | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const logRegex =
        /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w{3})\]\s+(.+)$/;
      const match = line.match(logRegex);

      if (match) {
        const [, timestamp, level, message] = match;
        currentEntry = {
          timestamp,
          level: level.toLowerCase(),
          message: message.trim(),
          raw: line,
          index: i,
          isMultiLine: false,
        };
        entries.push(currentEntry);
      } else {
        if (currentEntry) {
          currentEntry.message += "\n" + line;
          currentEntry.raw += "\n" + line;
          entries.push({
            ...currentEntry,
            index: i,
            isMultiLine: true,
          });
        } else {
          currentEntry = {
            timestamp: "",
            level: "inf",
            message: line,
            raw: line,
            index: i,
            isMultiLine: false,
          };
          entries.push(currentEntry);
        }
      }
    }

    return entries.reverse();
  }, [rawLogs]);

  const filteredEntries = useMemo(() => {
    let filtered = logEntries;

    if (filters.level !== "all") {
      filtered = filtered.filter((entry) => entry.level === filters.level);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.message.toLowerCase().includes(searchLower) ||
          entry.timestamp.toLowerCase().includes(searchLower) ||
          entry.raw.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [logEntries, filters.level, filters.search]);

  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const currentPageEntries = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, currentPage, pageSize]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await solutionsApi.getLogs();
      setRawLogs(response.data);
      setError("");
    } catch (err) {
      setError("Ошибка загрузки логов");
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    let interval: number;
    if (filters.autoRefresh) {
      interval = setInterval(loadLogs, autoRefreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filters.autoRefresh, autoRefreshInterval]);

  const levelStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    logEntries.forEach((entry) => {
      if (!entry.isMultiLine) {
        stats[entry.level] = (stats[entry.level] || 0) + 1;
      }
    });
    return stats;
  }, [logEntries]);

  const downloadLogs = () => {
    const content =
      filters.level === "all" && !filters.search
        ? rawLogs
        : filteredEntries.map((e) => e.raw).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      level: "all",
      search: "",
      autoRefresh: filters.autoRefresh,
    });
    setCurrentPage(0);
  };

  if (loading && !rawLogs) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Загрузка логов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Просмотр логов
              </h1>
              <p className="text-gray-400">
                {logEntries.length.toLocaleString()} строк,{" "}
                {filteredEntries.length.toLocaleString()} отфильтровано
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadLogs}
                className="bg-[#e85353] hover:bg-[#d64242] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <RefreshIcon />
                <span>Обновить</span>
              </button>

              <button
                onClick={downloadLogs}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <DownloadIcon />
                <span>Скачать</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] rounded-2xl p-6 border border-[#444444] mb-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Level Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Уровень логирования
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "all", label: "Все", color: "bg-gray-500" },
                  { value: "trc", label: "Trace", color: "bg-gray-400" },
                  { value: "dbg", label: "Debug", color: "bg-blue-500" },
                  { value: "inf", label: "Info", color: "bg-green-500" },
                  { value: "wrn", label: "Warn", color: "bg-yellow-500" },
                  { value: "err", label: "Error", color: "bg-orange-500" },
                  { value: "ftl", label: "Fatal", color: "bg-red-500" },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, level: level.value }))
                    }
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                      filters.level === level.value
                        ? `${level.color} text-white shadow-lg`
                        : "bg-[#444444] text-gray-300 hover:bg-[#4a4a4a]"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Поиск по логам
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Введите текст для поиска..."
                  className="w-full bg-[#444444] border border-[#555555] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353]/20 transition-all duration-200"
                />
                {filters.search && (
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, search: "" }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  Автообновление
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.autoRefresh}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          autoRefresh: e.target.checked,
                        }))
                      }
                      className="sr-only"
                      id="auto-refresh"
                    />
                    <label
                      htmlFor="auto-refresh"
                      className={`block w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                        filters.autoRefresh ? "bg-[#e85353]" : "bg-[#555555]"
                      }`}
                    >
                      <div
                        className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                          filters.autoRefresh
                            ? "transform translate-x-7"
                            : "transform translate-x-1"
                        }`}
                      ></div>
                    </label>
                  </div>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) =>
                      setAutoRefreshInterval(Number(e.target.value))
                    }
                    className="bg-[#444444] border border-[#555555] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#e85353]"
                  >
                    <option value={10}>10с</option>
                    <option value={30}>30с</option>
                    <option value={60}>1м</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  Строк на странице
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="bg-[#444444] border border-[#555555] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#e85353]"
                >
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={2000}>2000</option>
                  <option value={5000}>5000</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#444444]">
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ClearIcon />
              <span>Сбросить фильтры</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] rounded-2xl p-6 border border-[#444444] mb-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">
            Статистика логов
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {["all", "trc", "dbg", "inf", "wrn", "err", "ftl"].map((level) => (
              <div
                key={level}
                className="text-center p-4 bg-[#444444] rounded-xl hover:bg-[#4a4a4a] transition-colors duration-200"
              >
                <div
                  className={`text-lg font-bold mb-1 ${getLevelTextColor(
                    level
                  )}`}
                >
                  {levelStats[level] || 0}
                </div>
                <div className="text-xs text-gray-300 font-medium uppercase tracking-wide">
                  {level === "all" ? "Всего" : level}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] rounded-2xl p-4 border border-[#444444] mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Страница{" "}
                <span className="text-white font-semibold">
                  {currentPage + 1}
                </span>{" "}
                из{" "}
                <span className="text-white font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PaginationButton
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  ⟪
                </PaginationButton>
                <PaginationButton
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  ⟨
                </PaginationButton>
                <span className="text-white px-4 font-medium">
                  {currentPage + 1}
                </span>
                <PaginationButton
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  ⟩
                </PaginationButton>
                <PaginationButton
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  ⟫
                </PaginationButton>
              </div>
            </div>
          </div>
        )}

        {/* Logs Display */}
        <div className="bg-gradient-to-br from-[#3a3a3a] to-[#2d2d2d] rounded-2xl border border-[#444444] overflow-hidden shadow-2xl">
          <div ref={containerRef} className="h-96 overflow-y-auto bg-[#2a2a2a]">
            {currentPageEntries.map((entry) => (
              <LogLine
                key={entry.index}
                entry={entry}
                searchTerm={filters.search}
              />
            ))}
          </div>
        </div>

        {filters.autoRefresh && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-[#3a3a3a] px-4 py-2 rounded-lg border border-[#444444]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-sm">
                Автообновление каждые {autoRefreshInterval} секунд
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LogLine: React.FC<{ entry: LogEntry; searchTerm: string }> = ({
  entry,
  searchTerm,
}) => {
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;

    const parts = text.split(new RegExp(`(${escapeRegex(search)})`, "gi"));

    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-400 text-black font-semibold px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  return (
    <div
      className={`font-mono text-sm whitespace-pre-wrap px-4 py-2 border-b border-[#444444] hover:bg-[#444444] transition-colors duration-150 ${getLevelColor(
        entry.level
      )} ${entry.isMultiLine ? "opacity-80" : ""}`}
    >
      {!entry.isMultiLine && entry.timestamp && (
        <span className="text-purple-300 mr-4">
          {highlightText(`[${entry.timestamp}]`, searchTerm)}
        </span>
      )}
      {!entry.isMultiLine && (
        <span className={`font-bold ${getLevelTextColor(entry.level)} mr-4`}>
          {highlightText(entry.level.toUpperCase(), searchTerm)}
        </span>
      )}
      {entry.isMultiLine && <span className="ml-16 text-gray-400">↳</span>}
      <span
        className={`${entry.isMultiLine ? "text-gray-300 ml-2" : "text-white"}`}
      >
        {highlightText(entry.message, searchTerm)}
      </span>
    </div>
  );
};

// Icon Components
const RefreshIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ClearIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
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
);

const PaginationButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-[#444444] disabled:opacity-30 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#4a4a4a] transition-colors duration-200 disabled:hover:bg-[#444444]"
  >
    {children}
  </button>
);

const getLevelColor = (level: string) => {
  switch (level) {
    case "ftl":
      return "bg-red-900 bg-opacity-20";
    case "err":
      return "bg-red-900 bg-opacity-10";
    case "wrn":
      return "bg-yellow-900 bg-opacity-10";
    case "inf":
      return "bg-green-900 bg-opacity-10";
    case "dbg":
      return "bg-blue-900 bg-opacity-10";
    case "trc":
      return "bg-gray-900 bg-opacity-10";
    default:
      return "";
  }
};

const getLevelTextColor = (level: string) => {
  switch (level) {
    case "ftl":
      return "text-red-400";
    case "err":
      return "text-red-300";
    case "wrn":
      return "text-yellow-300";
    case "inf":
      return "text-green-300";
    case "dbg":
      return "text-blue-300";
    case "trc":
      return "text-gray-400";
    default:
      return "text-gray-300";
  }
};

export default LogsViewer;
