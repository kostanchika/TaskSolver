import React, { useState, useEffect } from "react";
import { solutionsApi } from "../../api/statistics/statistics";
import {
  SolveStatisticsDto,
  TaskStatisticsDto,
} from "../../api/statistics/types";
import { programmingTasksApi } from "../../api/programming-tasks/programming-tasks";
import { ProgrammingTaskDto } from "../../api/programming-tasks/types";
import { useNavigate } from "react-router-dom";

export const StatisticsAdmin: React.FC = () => {
  const [solveStatistics, setSolveStatistics] =
    useState<SolveStatisticsDto | null>(null);
  const [tasks, setTasks] = useState<ProgrammingTaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [statsResponse, tasksResponse] = await Promise.all([
        solutionsApi.getSolveStatistics(),
        programmingTasksApi.getAll(null, null, null, null, null, null, null),
      ]);
      setSolveStatistics(statsResponse.data);
      setTasks(tasksResponse.data.items);
    } catch (err) {
      setError("Ошибка загрузки статистики");
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Загрузка статистики...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-sm mb-2">{error}</div>
          <button
            onClick={loadStatistics}
            className="bg-[#e85353] hover:bg-[#d64242] text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Статистика решений
          </h1>
          <p className="text-gray-400 text-sm">
            Аналитика производительности системы
          </p>
        </div>

        <div className="bg-[#3a3a3a] rounded p-1 mb-4 inline-flex border border-[#444444]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === "overview"
                ? "bg-[#e85353] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Общая статистика
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === "tasks"
                ? "bg-[#e85353] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Статистика задач
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "overview" && solveStatistics && (
            <OverviewTab solveStatistics={solveStatistics} />
          )}
          {activeTab === "tasks" && solveStatistics && (
            <TasksTab
              tasksStatistics={solveStatistics.tasksStatistics}
              tasks={tasks}
              onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface OverviewTabProps {
  solveStatistics: SolveStatisticsDto;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ solveStatistics }) => {
  const successRate =
    solveStatistics.totalSolutions > 0
      ? (solveStatistics.correctSolutions / solveStatistics.totalSolutions) *
        100
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Всего решений"
          value={solveStatistics.totalSolutions.toString()}
        />
        <MetricCard
          title="Правильных"
          value={solveStatistics.correctSolutions.toString()}
        />
        <MetricCard title="Успешность" value={`${successRate.toFixed(1)}%`} />
        <MetricCard
          title="Активных пользователей"
          value={solveStatistics.activeUsers.toString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
          <h3 className="text-base font-semibold text-white mb-2">
            Среднее время выполнения
          </h3>
          <div className="text-2xl font-bold text-[#e85353]">
            {solveStatistics.avgSolutionTimeSeconds.toFixed(2)}с
          </div>
          <div className="text-gray-400 text-xs mt-1">
            среднее время выполнения кода
          </div>
        </div>

        <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
          <h3 className="text-base font-semibold text-white mb-2">
            Тесты в неправильных решениях
          </h3>
          <div className="text-2xl font-bold text-[#e85353]">
            {solveStatistics.avgSolvedTestsInIncorrectSolution.toFixed(1)}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            пройденных тестов на решение
          </div>
        </div>
      </div>

      <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
        <h3 className="text-base font-semibold text-white mb-3">
          Статистика успешности
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Правильные решения</span>
            <span className="text-white text-sm">
              {solveStatistics.correctSolutions}
            </span>
          </div>
          <div className="w-full bg-[#444444] rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Неправильные решения</span>
            <span className="text-white text-sm">
              {solveStatistics.totalSolutions -
                solveStatistics.correctSolutions}
            </span>
          </div>
          <div className="w-full bg-[#444444] rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  solveStatistics.totalSolutions > 0 ? 100 - successRate : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TasksTabProps {
  tasksStatistics: TaskStatisticsDto[];
  tasks: ProgrammingTaskDto[];
  onTaskClick: (taskId: string) => void;
}

const TasksTab: React.FC<TasksTabProps> = ({
  tasksStatistics,
  tasks,
  onTaskClick,
}) => {
  const taskStatsWithInfo = tasksStatistics
    .map((stat) => {
      const taskInfo = tasks.find((task) => task.id === stat.taskId);
      return {
        ...stat,
        taskName: taskInfo?.name || "Неизвестная задача",
        taskDescription: taskInfo?.description || "",
        difficulty: taskInfo?.degree || 0,
      };
    })
    .sort((a, b) => b.totalSolutions - a.totalSolutions);

  const totalSolutions = taskStatsWithInfo.reduce(
    (sum, task) => sum + task.totalSolutions,
    0
  );
  const totalCorrect = taskStatsWithInfo.reduce(
    (sum, task) => sum + task.correctSolutions,
    0
  );
  const overallSuccessRate =
    totalSolutions > 0 ? (totalCorrect / totalSolutions) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
        <h3 className="text-base font-semibold text-white mb-3">
          Сводка по задачам
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {taskStatsWithInfo.length}
            </div>
            <div className="text-gray-400 text-xs">Всего задач</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{totalSolutions}</div>
            <div className="text-gray-400 text-xs">Всего решений</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{totalCorrect}</div>
            <div className="text-gray-400 text-xs">Правильных</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {overallSuccessRate.toFixed(1)}%
            </div>
            <div className="text-gray-400 text-xs">Успешность</div>
          </div>
        </div>
      </div>

      <div className="bg-[#3a3a3a] rounded border border-[#444444] overflow-hidden">
        <div className="p-4 border-b border-[#444444]">
          <h2 className="text-lg font-semibold text-white">
            Статистика по задачам
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Детальная аналитика решений
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#444444] border-b border-[#555555]">
                <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                  Задача
                </th>
                <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                  Решения
                </th>
                <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                  Правильные
                </th>
                <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                  Успешность
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#444444]">
              {taskStatsWithInfo.map((task) => (
                <TaskStatsRow
                  key={task.taskId}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </tbody>
          </table>
        </div>

        {taskStatsWithInfo.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#444444] flex items-center justify-center mx-auto mb-2 border border-[#555555] rounded-full">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-gray-400 text-sm">Нет данных по задачам</p>
            <p className="text-gray-500 text-xs mt-1">
              Задачи еще не решались пользователями
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskStatsRowProps {
  task: TaskStatisticsDto & {
    taskName: string;
    taskDescription: string;
    difficulty: number;
  };
  onTaskClick: (taskId: string) => void;
}

const TaskStatsRow: React.FC<TaskStatsRowProps> = ({ task, onTaskClick }) => {
  const successRate =
    task.totalSolutions > 0
      ? (task.correctSolutions / task.totalSolutions) * 100
      : 0;

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      "text-green-400",
      "text-green-400",
      "text-yellow-400",
      "text-orange-400",
      "text-orange-400",
      "text-red-400",
      "text-red-400",
      "text-purple-400",
    ];
    return colors[difficulty] || "text-gray-400";
  };

  const difficultyNames = [
    "Sigil 0",
    "Sigil 1",
    "Sigil 2",
    "Sigil 3",
    "Sigil 4",
    "Sigil 5",
    "Sigil 6",
    "Sigil 7",
  ];

  return (
    <tr
      className="hover:bg-[#444444] transition-colors cursor-pointer"
      onClick={() => onTaskClick(task.taskId)}
    >
      <td className="px-4 py-3">
        <div className="flex flex-col space-y-1">
          <div className="text-white font-medium hover:text-[#e85353] transition-colors text-sm">
            {task.taskName}
          </div>
          <div className="text-gray-500 text-xs line-clamp-1">
            {task.taskDescription}
          </div>
          <div className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
            {difficultyNames[task.difficulty] || `Уровень ${task.difficulty}`}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-300 font-bold text-sm">
          {task.totalSolutions}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-300 text-sm">{task.correctSolutions}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-[#444444] rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
          <span className="text-gray-300 text-xs w-10">
            {successRate.toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
  return (
    <div className="bg-[#3a3a3a] rounded p-3 border border-[#444444]">
      <h3 className="text-gray-400 text-xs mb-1">{title}</h3>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
};

export default StatisticsAdmin;
