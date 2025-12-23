// components/profile/ProfileView.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../api/users/users";
import { solutionsApi } from "../../api/statistics/statistics";
import { ProfileDto } from "../../api/users/types";
import { StatisticsDto } from "../../api/statistics/types";
import { getStaticUrl } from "../../utils/url";
import { SocialIcon } from "./SocialIcons";

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { userId } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      let profileResponse;
      let statsResponse;

      if (userId) {
        [profileResponse, statsResponse] = await Promise.all([
          usersApi.getUserById(userId),
          solutionsApi.getByUserId(userId),
        ]);
      } else {
        [profileResponse, statsResponse] = await Promise.all([
          usersApi.getMyProfile(),
          solutionsApi.getMy(),
        ]);
      }

      setProfile(profileResponse.data);
      setStats(
        Array.isArray(statsResponse.data)
          ? statsResponse.data[0]
          : statsResponse.data
      );
    } catch {
      setError("Не удалось загрузить профиль");
    } finally {
      setIsLoading(false);
    }
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

  const formatRating = (rating: number) => {
    return Math.round(rating);
  };

  const getSuccessRate = (userStats: StatisticsDto) => {
    return userStats.totalSolutions > 0
      ? Math.round((userStats.goodSolutions / userStats.totalSolutions) * 100)
      : 0;
  };

  const displayName = profile?.profileName || "Анонимный разработчик";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white font-mono">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#e85353] font-mono text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="bg-[#e85353] hover:bg-[#d64242] text-white font-mono py-2 px-4 rounded-lg transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Хедер профиля */}
        <div className="bg-[#2a2a2a] rounded-xl p-8 border border-[#333333] shadow-lg mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6 flex-1">
              {profile?.avatarUrl ? (
                <img
                  src={getStaticUrl(profile.avatarUrl)}
                  alt={displayName}
                  className="w-24 h-24 rounded-xl border-2 border-[#333333]"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#e85353] to-[#d64242] rounded-xl border-2 border-[#333333] flex items-center justify-center">
                  <span className="text-white font-mono text-2xl font-bold">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-3xl font-bold text-white font-mono">
                    {displayName}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate("/profile/settings")}
                      className="bg-[#333333] hover:bg-[#3a3a3a] text-gray-300 font-mono text-sm py-2 px-4 rounded-lg transition-colors border border-[#444444]"
                    >
                      Редактировать
                    </button>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-xl text-gray-300 font-mono mb-4">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#e85353]">ID:</span>
                    <span className="text-gray-300">{profile?.userId}</span>
                  </div>
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400">Навыки:</span>
                      <span className="text-gray-300">
                        {profile.skills.length}
                      </span>
                    </div>
                  )}
                  {profile?.socialLinks && profile.socialLinks.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">Соцсети:</span>
                      <span className="text-gray-300">
                        {profile.socialLinks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Блок рейтинга */}
            {stats && (
              <div className="bg-[#2d2d2d] rounded-xl p-6 border border-[#333333] min-w-64">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getRankColor(
                        stats.rating
                      )}`}
                    ></div>
                    <span className="text-gray-400 font-mono text-sm">
                      Рейтинг
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-bold mb-2 ${getRatingColor(
                      stats.rating
                    )}`}
                  >
                    {formatRating(stats.rating)}
                  </div>
                  <div
                    className={`font-mono text-sm font-medium ${getRatingColor(
                      stats.rating
                    )} mb-4`}
                  >
                    {getRank(stats.rating)}
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-mono text-sm">
                        Решения
                      </span>
                      <span className="text-white font-mono text-sm">
                        <span className="text-emerald-400">
                          {stats.goodSolutions}
                        </span>
                        <span className="text-gray-500">/</span>
                        {stats.totalSolutions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-mono text-sm">
                        Успешность
                      </span>
                      <span
                        className={`font-mono text-sm ${
                          getSuccessRate(stats) >= 80
                            ? "text-emerald-400"
                            : getSuccessRate(stats) >= 60
                            ? "text-blue-400"
                            : getSuccessRate(stats) >= 40
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {getSuccessRate(stats)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-mono text-sm">
                        Процентиль
                      </span>
                      <span className="text-white font-mono text-sm">
                        {stats.percentile}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Описание */}
            {profile?.description && (
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
                <h3 className="text-lg font-semibold text-white font-mono mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>О себе</span>
                </h3>
                <p className="text-gray-300 font-mono leading-relaxed">
                  {profile.description}
                </p>
              </div>
            )}

            {/* Навыки */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
                <h3 className="text-lg font-semibold text-white font-mono mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span>Навыки и технологии</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-emerald-600 text-white font-mono text-sm px-4 py-2 rounded-lg border border-emerald-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-8">
            {/* Социальные ссылки */}
            {profile?.socialLinks && profile.socialLinks.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
                <h3 className="text-lg font-semibold text-white font-mono mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>Социальные сети</span>
                </h3>
                <div className="space-y-3">
                  {profile.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 bg-[#2d2d2d] hover:bg-[#333333] p-3 rounded-lg border border-[#333333] transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                        <SocialIcon
                          platform={link.platform}
                          className="w-4 h-4 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-mono text-sm font-medium truncate">
                          {link.platform}
                        </div>
                        <div className="text-gray-400 font-mono text-xs truncate">
                          {link.url}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Статистика активности */}
            {stats && (
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
                <h3 className="text-lg font-semibold text-white font-mono mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-[#e85353]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Статистика</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-sm">
                      Всего решений
                    </span>
                    <span className="text-white font-mono font-medium">
                      {stats.totalSolutions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-sm">
                      Успешных решений
                    </span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {stats.goodSolutions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-sm">
                      Эффективность
                    </span>
                    <span className="text-white font-mono font-medium">
                      {getSuccessRate(stats)}%
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#333333]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-mono text-sm">
                        Позиция в рейтинге
                      </span>
                      <span className="text-[#e85353] font-mono font-medium">
                        #{stats.percentile}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Сообщение если профиль пустой */}
        {!profile?.description &&
          (!profile?.skills || profile.skills.length === 0) &&
          (!profile?.socialLinks || profile.socialLinks.length === 0) &&
          isOwnProfile && (
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-xl p-6 text-center mt-8">
              <div className="text-yellow-200 font-mono text-lg mb-2">
                Профиль не заполнен
              </div>
              <p className="text-yellow-100 font-mono mb-4">
                Расскажите о себе, добавьте навыки и социальные сети
              </p>
              <button
                onClick={() => navigate("/profile/settings")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-mono py-2 px-6 rounded-lg transition-colors"
              >
                Заполнить профиль
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
