// components/UserProfileWithRating.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usersApi } from "../../api/users/users";
import { solutionsApi } from "../../api/statistics/statistics";
import { ProfileDto } from "../../api/users/types";
import { StatisticsDto } from "../../api/statistics/types";
import { getStaticUrl } from "../../utils/url";
import { useSignalR } from "../../hooks/useSignalR";
import { ProgrammingTaskDto } from "../../api/programming-tasks/types";
import { programmingTasksApi } from "../../api/programming-tasks/programming-tasks";

export const UserProfileWithRating: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatsHovered, setIsStatsHovered] = useState(false);
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedTask, setRecommendedTask] =
    useState<ProgrammingTaskDto | null>(null);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState<ProgrammingTaskDto[]>([]);

  const { clearTokens, isAdmin } = useAuth();

  // Загружаем профиль и статистику
  useEffect(() => {
    loadProfileAndStats();
  }, [location.pathname]);

  useEffect(() => {
    loadRecommendedTask();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsStatsHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProfileAndStats = async () => {
    try {
      setIsLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        usersApi.getMyProfile(),
        solutionsApi.getMy(),
      ]);

      setProfile(profileResponse.data);
      setStats(
        Array.isArray(statsResponse.data)
          ? statsResponse.data[0]
          : statsResponse.data
      );
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!stats) return;
    const load = async () => {
      const results = await Promise.all(
        stats.history.map((h) => programmingTasksApi.getById(h.taskId))
      );
      setTasks(results.map((r) => r.data));
    };
    load();
  }, [stats]);

  const loadRecommendedTask = async () => {
    try {
      setIsTaskLoading(true);
      const result = await solutionsApi.getRecommendedTask();
      setRecommendedTask(result.data);
    } catch (error) {
      console.error("Ошибка загрузки рекомендованной задачи:", error);
      setRecommendedTask(null);
    } finally {
      setIsTaskLoading(false);
    }
  };

  const getRank = (rating: number) => {
    if (rating >= 2100) return "Великий Магистр";
    if (rating >= 1800) return "Архитектор";
    if (rating >= 1500) return "Сеньор";
    if (rating >= 1200) return "Эксперт";
    if (rating >= 900) return "Специалист";
    if (rating >= 600) return "Разработчик";
    if (rating >= 300) return "Практик";
    return "Новичок";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2100) return "text-amber-300";
    if (rating >= 1800) return "text-purple-300";
    if (rating >= 1500) return "text-blue-300";
    if (rating >= 1200) return "text-emerald-300";
    if (rating >= 900) return "text-green-300";
    if (rating >= 600) return "text-yellow-300";
    if (rating >= 300) return "text-gray-300";
    return "text-gray-400";
  };

  const getRankColor = (rating: number) => {
    if (rating >= 2100) return "bg-amber-500";
    if (rating >= 1800) return "bg-purple-500";
    if (rating >= 1500) return "bg-blue-500";
    if (rating >= 1200) return "bg-emerald-500";
    if (rating >= 900) return "bg-green-500";
    if (rating >= 600) return "bg-yellow-500";
    if (rating >= 300) return "bg-gray-400";
    return "bg-gray-500";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "легкая":
      case "easy":
        return "text-emerald-400";
      case "средняя":
      case "medium":
        return "text-yellow-400";
      case "сложная":
      case "hard":
        return "text-[#e85353]";
      default:
        return "text-gray-400";
    }
  };

  const formatRating = (rating: number) => {
    return Math.round(rating);
  };

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTaskClick = () => {
    if (recommendedTask) {
      navigate(`/tasks/${recommendedTask.id}`);
      setIsMenuOpen(false);
    }
  };

  useSignalR({
    url: `${import.meta.env.VITE_API_URL}/solutionsHub`,
    onSolutionCompleted: () => {
      loadProfileAndStats();
      loadRecommendedTask();
    },
  });
  useSignalR({
    url: `${import.meta.env.VITE_API_URL}/matchmakingHub`,
    onMatchUpdated: () => {
      loadProfileAndStats();
      loadRecommendedTask();
    },
  });

  const displayName = profile?.profileName || "Пользователь";

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4 bg-[#2a2a2a] border border-[#333333] rounded-xl px-4 py-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-px h-6 bg-[#333333]"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Основная кнопка - объединенный компонент */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-4 bg-[#2a2a2a] hover:bg-[#2f2f2f] border border-[#333333] rounded-xl px-4 py-2 transition-all duration-300 group shadow-lg"
      >
        {/* Левая часть - рейтинг */}
        {!isAdmin && (
          <div
            className="flex items-center space-x-3 pr-4 border-r border-[#333333]"
            onMouseEnter={(e) => {
              e.stopPropagation();
              setIsStatsHovered(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              if (!isMenuOpen) setIsStatsHovered(false);
            }}
          >
            {stats ? (
              <>
                <div
                  className={`w-3 h-3 rounded-full ${getRankColor(
                    stats.rating
                  )} group-hover:scale-110 transition-transform shadow-md`}
                ></div>
                <div className="flex flex-col items-start">
                  <span
                    className={`font-mono font-bold text-base ${getRatingColor(
                      stats.rating
                    )}`}
                  >
                    {formatRating(stats.rating)}
                  </span>
                  <span className="text-gray-400 font-mono text-xs">
                    {getRank(stats.rating)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 font-mono text-sm">—</span>
              </div>
            )}
          </div>
        )}

        {/* Правая часть - профиль */}
        <div className="flex items-center space-x-3">
          {profile?.avatarUrl ? (
            <img
              src={getStaticUrl(profile.avatarUrl)}
              alt={displayName}
              className="w-9 h-9 rounded-full group-hover:scale-110 transition-transform border-2 border-[#333333]"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-[#e85353] to-[#d64242] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-[#333333]">
              <span className="text-white font-mono text-xs font-bold">
                {getInitials(displayName)}
              </span>
            </div>
          )}

          <div className="flex flex-col items-start">
            <span className="text-white font-mono text-sm font-bold max-w-28 truncate">
              {displayName}
            </span>
            {isAdmin && (
              <span className="text-[#e85353] font-mono text-xs bg-[#e85353]/10 px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            )}
          </div>

          {/* Стрелка */}
          <div
            className={`transform transition-transform duration-300 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Выпадающее окно статистики при наведении на рейтинг */}
      {isStatsHovered && stats && !isMenuOpen && (
        <div className="absolute top-full right-0 mt-r3 w-80 bg-[#2a2a2a] border border-[#333333] rounded-xl shadow-2xl z-50 p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-mono font-bold text-lg">
                Статистика
              </h3>
              <span
                className={`font-mono font-bold text-xl ${getRatingColor(
                  stats.rating
                )}`}
              >
                {formatRating(stats.rating)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#2d2d2d] rounded-lg border border-[#333333]">
                <div className="text-gray-400 font-mono text-xs mb-2">Ранг</div>
                <div className="text-white font-mono text-sm font-bold">
                  {getRank(stats.rating)}
                </div>
              </div>

              <div className="text-center p-3 bg-[#2d2d2d] rounded-lg border border-[#333333]">
                <div className="text-gray-400 font-mono text-xs mb-2">
                  Процентиль
                </div>
                <div className="text-white font-mono text-sm font-bold">
                  {stats.percentile}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono text-sm">
                  Всего решений:
                </span>
                <span className="text-white font-mono text-sm font-medium">
                  {stats.totalSolutions}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono text-sm">
                  Успешных:
                </span>
                <span className="text-emerald-400 font-mono text-sm font-medium">
                  {stats.goodSolutions}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono text-sm">
                  Эффективность:
                </span>
                <span className="text-white font-mono text-sm font-medium">
                  {stats.totalSolutions > 0
                    ? Math.round(
                        (stats.goodSolutions / stats.totalSolutions) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              {tasks.map((t) => {
                return (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-sm">
                      {t.name}
                    </span>
                    <span className="text-emerald-400 font-mono text-sm font-medium">
                      +{stats.history.find((h) => h.taskId == t.id)?.difference}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Выпадающее меню при клике */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-[#2a2a2a] border border-[#333333] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Информация о пользователе */}
          <div className="p-5 border-b border-[#333333]">
            <div className="flex items-center space-x-3 mb-4">
              {profile?.avatarUrl ? (
                <img
                  src={getStaticUrl(profile.avatarUrl)}
                  alt={displayName}
                  className="w-12 h-12 rounded-full border-2 border-[#333333]"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#e85353] to-[#d64242] rounded-full flex items-center justify-center border-2 border-[#333333]">
                  <span className="text-white font-mono text-sm font-bold">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-mono text-base font-bold truncate">
                  {displayName}
                </p>
                {isAdmin ? (
                  <p className="text-[#e85353] font-mono text-xs mt-1">
                    Администратор
                  </p>
                ) : (
                  <p className="text-gray-400 font-mono text-xs truncate mt-1">
                    {profile?.bio || "Разработчик"}
                  </p>
                )}
              </div>
            </div>

            {/* Рекомендованная задача */}
            {recommendedTask && !isAdmin && (
              <div
                className="mt-4 p-3 bg-[#2d2d2d] border border-[#333333] rounded-lg hover:border-[#e85353]/50 transition-all duration-200 cursor-pointer"
                onClick={handleTaskClick}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#e85353] font-mono text-xs font-bold bg-[#e85353]/10 px-2 py-1 rounded">
                    РЕКОМЕНДАЦИЯ
                  </span>
                  <span
                    className={`text-xs font-mono ${getDifficultyColor("")}`}
                  >
                    {"Sigil " + recommendedTask.degree}
                  </span>
                </div>
                <p className="text-white font-mono text-sm font-bold truncate">
                  {recommendedTask.name}
                </p>
                <p className="text-gray-400 font-mono text-xs mt-1 truncate">
                  {recommendedTask.description}
                </p>
              </div>
            )}

            {isTaskLoading && (
              <div className="mt-4 p-3 bg-[#2d2d2d] border border-[#333333] rounded-lg">
                <div className="animate-pulse flex space-x-3">
                  <div className="w-16 h-4 bg-gray-600 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Пункты меню */}
          <div className="p-2 space-y-1">
            {!isAdmin && (
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#2d2d2d] rounded-lg transition-all duration-200 font-mono text-sm group"
              >
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-[#e85353] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Мой профиль</span>
              </button>
            )}

            <div className="border-t border-[#333333] my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[#e85353] hover:bg-[#2d2d2d] rounded-lg transition-all duration-200 font-mono text-sm group"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
