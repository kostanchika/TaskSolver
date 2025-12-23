// /src/components/tasks/TaskCatalog.tsx
import { useEffect, useState, useRef } from "react";
import {
  ProgrammingTaskDto,
  TaskDegree,
} from "../../api/programming-tasks/types";
import { programmingTasksApi } from "../../api/programming-tasks/programming-tasks";
import { useNavigate } from "react-router-dom";

export const TaskCatalog = () => {
  const [tasks, setTasks] = useState<ProgrammingTaskDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: "",
    keywords: "",
    difficulty: "all" as TaskDegree | "all",
    markFrom: "" as number | "",
    markTo: "" as number | "",
  });
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "mark">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const keywordsInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Основной эффект загрузки данных
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await programmingTasksApi.getAll(
          filters.searchTerm || null,
          filters.keywords || null,
          filters.difficulty !== "all" ? filters.difficulty : null,
          filters.markFrom !== "" ? filters.markFrom : null,
          filters.markTo !== "" ? filters.markTo : null,
          currentPage,
          pageSize
        );
        setTasks(response.data.items);
        setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Ошибка загрузки задач:", error);
      }
    };
    fetchTasks();
  }, [filters, currentPage, pageSize]);

  const onTaskSelect = (task: ProgrammingTaskDto) => {
    navigate(`/tasks/${task.id}`);
  };

  const getDifficultyColor = (degree: TaskDegree) => {
    const colors = {
      [TaskDegree.VeryEasy]: "text-emerald-400",
      [TaskDegree.Easy]: "text-green-400",
      [TaskDegree.Medium]: "text-yellow-400",
      [TaskDegree.Hard]: "text-orange-400",
      [TaskDegree.VeryHard]: "text-red-400",
      [TaskDegree.Expert]: "text-purple-400",
      [TaskDegree.Master]: "text-indigo-400",
      [TaskDegree.Legendary]: "text-pink-400",
    };
    return colors[degree];
  };

  const getDifficultyText = (degree: TaskDegree) => {
    const names = {
      [TaskDegree.VeryEasy]: "Sigil0",
      [TaskDegree.Easy]: "Sigil1",
      [TaskDegree.Medium]: "Sigil2",
      [TaskDegree.Hard]: "Sigil3",
      [TaskDegree.VeryHard]: "Sigil4",
      [TaskDegree.Expert]: "Sigil5",
      [TaskDegree.Master]: "Sigil6",
      [TaskDegree.Legendary]: "Sigil7",
    };
    return names[degree];
  };

  const getDifficultyBgColor = (degree: TaskDegree) => {
    const colors = {
      [TaskDegree.VeryEasy]: "bg-emerald-500/20 border-emerald-500/50",
      [TaskDegree.Easy]: "bg-green-500/20 border-green-500/50",
      [TaskDegree.Medium]: "bg-yellow-500/20 border-yellow-500/50",
      [TaskDegree.Hard]: "bg-orange-500/20 border-orange-500/50",
      [TaskDegree.VeryHard]: "bg-red-500/20 border-red-500/50",
      [TaskDegree.Expert]: "bg-purple-500/20 border-purple-500/50",
      [TaskDegree.Master]: "bg-indigo-500/20 border-indigo-500/50",
      [TaskDegree.Legendary]: "bg-pink-500/20 border-pink-500/50",
    };
    return colors[degree];
  };

  const getMarkColor = (mark: number) => {
    if (mark >= 9) return "text-green-400";
    if (mark >= 7) return "text-yellow-400";
    if (mark >= 5) return "text-orange-400";
    return "text-red-400";
  };

  const getMarkBgColor = (mark: number) => {
    if (mark >= 9) return "bg-green-500/20 border-green-500/50";
    if (mark >= 7) return "bg-yellow-500/20 border-yellow-500/50";
    if (mark >= 5) return "bg-orange-500/20 border-orange-500/50";
    return "bg-red-500/20 border-red-500/50";
  };

  const formatMark = (mark: number) => {
    return mark.toFixed(1);
  };

  // Мемоизированная сортировка
  const filteredTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "difficulty":
        return a.degree - b.degree;
      case "mark":
        return b.mark - a.mark;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      keywords: "",
      difficulty: "all",
      markFrom: "",
      markTo: "",
    });
    setCurrentPage(1);

    // Возвращаем фокус на поле поиска после очистки
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const updateFilter = (key: keyof typeof filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-[#333333] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-mono mb-2">
            Каталог задач
          </h1>
          <p className="text-gray-400 font-mono">Выберите задачу для решения</p>
        </div>

        {/* Filters */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 mb-6 border border-[#333333] shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Поиск по названию
              </label>
              <input
                ref={searchInputRef}
                type="text"
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                placeholder="Название задачи..."
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Ключевые слова
              </label>
              <input
                ref={keywordsInputRef}
                type="text"
                value={filters.keywords}
                onChange={(e) => updateFilter("keywords", e.target.value)}
                placeholder="Ключевые слова..."
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Сложность
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) =>
                  updateFilter(
                    "difficulty",
                    e.target.value as TaskDegree | "all"
                  )
                }
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              >
                <option value="all">Все сложности</option>
                {Object.values(TaskDegree)
                  .filter((value) => typeof value === "number")
                  .map((degree) => (
                    <option key={degree} value={degree}>
                      {getDifficultyText(degree as TaskDegree)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Сортировка
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "difficulty" | "mark")
                }
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              >
                <option value="name">По названию</option>
                <option value="difficulty">По сложности</option>
                <option value="mark">По оценке</option>
              </select>
            </div>
          </div>

          {/* Mark Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Оценка от
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.markFrom}
                onChange={(e) =>
                  updateFilter(
                    "markFrom",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="0.0"
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Оценка до
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.markTo}
                onChange={(e) =>
                  updateFilter(
                    "markTo",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="10.0"
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-[#2d2d2d] hover:bg-[#333333] text-gray-300 font-mono px-3 py-2 rounded-lg transition-colors border border-[#333333] text-sm"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>

          {/* Page Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Задач на странице
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#e85353] font-mono transition-colors text-sm"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-400 font-mono text-sm">
            Показано: {tasks.length} из {totalCount} задач
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskSelect(task)}
              className={`rounded-xl border transition-all duration-300 cursor-pointer p-6 shadow-lg hover:shadow-xl group
    ${
      task.isSolved
        ? "bg-[#2a2a2a] border-[#00ff00] hover:border-[#e85353]"
        : "bg-[#2a2a2a] border-[#333333] hover:border-[#e85353]"
    }
  `}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white font-mono group-hover:text-[#e85353] transition-colors line-clamp-2 flex-1 mr-2">
                  {task.name}
                </h3>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-mono font-bold border ${getDifficultyBgColor(
                    task.degree
                  )} ${getDifficultyColor(task.degree)} flex-shrink-0`}
                >
                  {getDifficultyText(task.degree)}
                </div>
              </div>

              {/* Mark */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-mono text-sm">
                    Рейтинг:
                  </span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-mono font-bold border ${getMarkBgColor(
                      task.mark
                    )} ${getMarkColor(task.mark)}`}
                  >
                    {formatMark(task.mark)}/10
                  </div>
                </div>
                <div className="w-full bg-[#333333] rounded-full h-2">
                  <div
                    className="bg-[#e85353] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(task.mark / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-gray-500 font-mono text-xs mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-mono leading-relaxed">
                {task.description}
              </p>

              <div className="flex justify-between items-center">
                {task.keywords && task.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 flex-1 mr-2">
                    {task.keywords.slice(0, 2).map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-[#2d2d2d] text-gray-300 text-xs px-2 py-1 rounded border border-[#333333] font-mono"
                      >
                        {keyword}
                      </span>
                    ))}
                    {task.keywords.length > 2 && (
                      <span className="text-gray-500 text-xs font-mono">
                        +{task.keywords.length - 2}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-gray-500 text-xs font-mono whitespace-nowrap">
                  {task.tests?.length || 0} тестов
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-[#2a2a2a] disabled:opacity-50 text-white font-mono px-4 py-2 rounded-lg transition-colors border border-[#333333] hover:border-[#e85353] disabled:hover:border-[#333333]"
            >
              Назад
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 font-mono rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#e85353] text-white"
                        : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333] border border-[#333333]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="bg-[#2a2a2a] disabled:opacity-50 text-white font-mono px-4 py-2 rounded-lg transition-colors border border-[#333333] hover:border-[#e85353] disabled:hover:border-[#333333]"
            >
              Вперед
            </button>
          </div>
        )}

        {/* {tasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-gray-500 font-mono text-lg mb-2">
              Задачи не найдены
            </div>
            <div className="text-gray-400 font-mono text-sm">
              {filters.searchTerm ||
              filters.difficulty !== "all" ||
              filters.keywords ||
              filters.markFrom !== "" ||
              filters.markTo !== ""
                ? "Попробуйте изменить параметры поиска"
                : "В каталоге пока нет задач"}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
