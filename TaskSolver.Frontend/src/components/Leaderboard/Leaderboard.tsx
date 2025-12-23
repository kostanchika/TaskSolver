// src/pages/Leaderboard/Leaderboard.tsx
import { useState, useEffect } from "react";
import { solutionsApi } from "../../api/statistics/statistics";
import { usersApi } from "../../api/users/users";
import { StatisticsDto } from "../../api/statistics/types";
import { ProfileDto } from "../../api/users/types";
import { getStaticUrl } from "../../utils/url";

interface LeaderboardUser extends StatisticsDto {
  profile: ProfileDto | null;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const statsResponse = await solutionsApi.getLeaderboard();

      const leaderboardData = await Promise.all(
        statsResponse.data.map(async (stat) => {
          try {
            const profileResponse = await usersApi.getUserById(stat.userId);
            return {
              ...stat,
              profile: profileResponse.data,
            };
          } catch {
            return {
              ...stat,
              profile: null,
            };
          }
        })
      );

      leaderboardData.sort((a, b) => b.rating - a.rating);
      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (error) {
      console.error("Ошибка загрузки лидерборда:", error);
    } finally {
      setIsLoading(false);
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

  const getRankColor = (rating: number) => {
    if (rating >= 2100) return "text-amber-300";
    if (rating >= 1800) return "text-purple-300";
    if (rating >= 1500) return "text-blue-300";
    if (rating >= 1200) return "text-emerald-300";
    if (rating >= 900) return "text-green-300";
    if (rating >= 600) return "text-yellow-300";
    if (rating >= 300) return "text-gray-300";
    return "text-gray-400";
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-br from-amber-500 to-yellow-500";
      case 2:
        return "bg-gradient-to-br from-gray-400 to-gray-300";
      case 3:
        return "bg-gradient-to-br from-orange-600 to-orange-500";
      default:
        return "bg-gray-600";
    }
  };

  const getSuccessRate = (user: StatisticsDto) => {
    return user.totalSolutions > 0
      ? Math.round((user.goodSolutions / user.totalSolutions) * 100)
      : 0;
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

  return (
    <div className="min-h-screen bg-[#333333] py-8">
      <div className="max-w-6xl mx-auto px-8">
        {/* Заголовок с боковыми элементами */}
        <div className="relative mb-12">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-32 h-px bg-gradient-to-r from-transparent to-[#e85353]"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-px bg-gradient-to-l from-transparent to-[#e85353]"></div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e85353] rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              ТОП РАЗРАБОТЧИКОВ
            </h1>
            <div className="w-24 h-0.5 bg-[#e85353] mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">
              10 лучших программистов платформы
            </p>
          </div>
        </div>

        {/* Основной контент с боковыми панелями */}
        <div className="flex space-x-8">
          {/* Центральная панель - таблица лидеров */}
          <div className="flex-1">
            <div className="bg-[#2a2a2a] rounded-xl border border-[#333333] overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85353]"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-500 text-lg">
                    Нет данных для отображения
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#333333]">
                  {leaderboard.map((user, index) => {
                    const position = index + 1;
                    const successRate = getSuccessRate(user);

                    return (
                      <div
                        key={user.userId}
                        className={`p-6 transition-all duration-300 hover:bg-[#2f2f2f] ${
                          position <= 3 ? "bg-[#2d2d2d]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Левая часть - позиция и профиль */}
                          <div className="flex items-center space-x-6 flex-1">
                            {/* Позиция */}
                            <div
                              className={`w-14 h-14 rounded-xl ${getPositionColor(
                                position
                              )} flex items-center justify-center`}
                            >
                              <span className="text-white font-bold text-lg">
                                {position}
                              </span>
                            </div>

                            {/* Аватар и имя */}
                            <a href={`/profile/${user.userId}`}>
                              <div className="flex items-center space-x-4 flex-1">
                                {user.profile?.avatarUrl ? (
                                  <img
                                    src={getStaticUrl(user.profile.avatarUrl)}
                                    alt={user.profile.profileName || "User"}
                                    className="w-12 h-12 rounded-full border-2 border-[#333333]"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#e85353] to-[#d64242] rounded-full flex items-center justify-center border-2 border-[#333333]">
                                    <span className="text-white font-bold text-xs">
                                      {getInitials(
                                        user.profile?.profileName ?? ""
                                      )}
                                    </span>
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-bold text-lg mb-1 truncate">
                                    {user.profile?.profileName ||
                                      "Анонимный разработчик"}
                                  </div>
                                  <div
                                    className={`text-sm font-medium ${getRankColor(
                                      user.rating
                                    )}`}
                                  >
                                    {getRank(user.rating)}
                                  </div>
                                </div>
                              </div>
                            </a>
                          </div>

                          {/* Центральная часть - рейтинг */}
                          <div className="text-center mx-8">
                            <div
                              className={`text-2xl font-bold ${getRankColor(
                                user.rating
                              )}`}
                            >
                              {Math.round(user.rating)}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              рейтинг
                            </div>
                          </div>

                          {/* Правая часть - статистика */}
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                              <div className="text-gray-400 text-right">
                                Решения
                              </div>
                              <div className="text-white font-medium text-left">
                                {user.goodSolutions}
                                <span className="text-gray-500">
                                  /{user.totalSolutions}
                                </span>
                              </div>

                              <div className="text-gray-400 text-right">
                                Успешность
                              </div>
                              <div
                                className={`font-medium text-left ${
                                  successRate >= 80
                                    ? "text-green-400"
                                    : successRate >= 60
                                    ? "text-blue-400"
                                    : successRate >= 40
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {successRate}%
                              </div>

                              <div className="text-gray-400 text-right">
                                Процентиль
                              </div>
                              <div className="text-white font-medium text-left">
                                {user.percentile}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Прогресс-бар для особых позиций */}
                        {position === 1 && (
                          <div className="mt-4 flex items-center space-x-3">
                            <div className="flex-1 bg-[#333333] rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"
                                style={{
                                  width: `${(user.rating / 2500) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                              Лидер сезона
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Легенда системы */}
            <div className="mt-8 bg-[#2a2a2a] rounded-xl p-6 border border-[#333333]">
              <h3 className="text-white font-bold text-lg mb-6 text-center">
                СИСТЕМА РАНГОВ
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    min: 2100,
                    rank: "Великий Магистр",
                    color: "text-amber-300",
                  },
                  { min: 1800, rank: "Архитектор", color: "text-purple-300" },
                  { min: 1500, rank: "Сеньор", color: "text-blue-300" },
                  { min: 1200, rank: "Эксперт", color: "text-emerald-300" },
                  { min: 900, rank: "Специалист", color: "text-green-300" },
                  { min: 600, rank: "Разработчик", color: "text-yellow-300" },
                  { min: 300, rank: "Практик", color: "text-gray-300" },
                  { min: 0, rank: "Новичок", color: "text-gray-400" },
                ].map((rankInfo, index) => (
                  <div
                    key={index}
                    className="text-center p-3 bg-[#2d2d2d] rounded-lg border border-[#333333]"
                  >
                    <div className={`font-bold text-sm mb-1 ${rankInfo.color}`}>
                      {rankInfo.rank}
                    </div>
                    <div className="text-gray-400 text-xs">{rankInfo.min}+</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
