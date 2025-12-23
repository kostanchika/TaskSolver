import React, { useState, useEffect } from "react";
import { solutionsApi } from "../../api/statistics/statistics";
import { ServerStatus } from "../../api/statistics/types";

export const ServerMonitoring: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadServerStatus = async () => {
    try {
      const response = await solutionsApi.getServerResources();
      setServerStatus(response.data);
      setLastUpdate(new Date());
      setError("");
    } catch (err) {
      setError("Ошибка загрузки статуса сервера");
      console.error("Error loading server status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServerStatus();

    const interval = setInterval(loadServerStatus, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !serverStatus) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Загрузка статуса сервера...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Мониторинг сервера
          </h1>
          <p className="text-gray-400 text-sm">
            Реальное время работы и использование ресурсов
          </p>
          {lastUpdate && (
            <div className="text-gray-500 text-xs mt-1">
              Последнее обновление: {lastUpdate.toLocaleTimeString("ru-RU")}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {serverStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
                <h3 className="text-base font-semibold text-white mb-3">
                  Использование CPU
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-[#e85353]">
                    {(serverStatus.cpuUsagePercent * 100).toFixed(1)}%
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      serverStatus.cpuUsagePercent > 0.8
                        ? "bg-red-500"
                        : serverStatus.cpuUsagePercent > 0.6
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                </div>
                <div className="w-full bg-[#444444] rounded-full h-2">
                  <div
                    className="bg-[#e85353] h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        serverStatus.cpuUsagePercent * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {serverStatus.cpuUsagePercent.toFixed(4)} доля использования
                </div>
              </div>

              <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
                <h3 className="text-base font-semibold text-white mb-3">
                  Использование памяти
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Используется:</span>
                    <span className="text-white text-sm">
                      {serverStatus.memoryWorkingSetMb} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Всего:</span>
                    <span className="text-white text-sm">
                      {serverStatus.totalMemoryMb.toLocaleString()} MB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Свободно:</span>
                    <span className="text-white text-sm">
                      {(
                        serverStatus.totalMemoryMb -
                        serverStatus.memoryWorkingSetMb
                      ).toLocaleString()}{" "}
                      MB
                    </span>
                  </div>
                  <div className="w-full bg-[#444444] rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (serverStatus.memoryWorkingSetMb /
                            serverStatus.totalMemoryMb) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-gray-400 text-xs">
                    {(
                      (serverStatus.memoryWorkingSetMb /
                        serverStatus.totalMemoryMb) *
                      100
                    ).toFixed(2)}
                    % использовано
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
                <h3 className="text-base font-semibold text-white mb-3">
                  Время сервера
                </h3>
                <div className="text-xl font-bold text-white text-center mb-1">
                  {new Date(serverStatus.serverTime).toLocaleTimeString(
                    "ru-RU"
                  )}
                </div>
                <div className="text-gray-400 text-sm text-center">
                  {new Date(serverStatus.serverTime).toLocaleDateString(
                    "ru-RU",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>

              <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
                <h3 className="text-base font-semibold text-white mb-3">
                  Время работы
                </h3>
                <div className="text-xl font-bold text-white text-center">
                  {formatUptime(serverStatus.uptime)}
                </div>
                <div className="text-gray-400 text-sm text-center mt-1">
                  сервер работает
                </div>
              </div>

              <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444]">
                <h3 className="text-base font-semibold text-white mb-3">
                  Потоки
                </h3>
                <div className="text-2xl font-bold text-[#e85353] text-center">
                  {serverStatus.threads}
                </div>
                <div className="text-gray-400 text-sm text-center mt-1">
                  активных потоков
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-[#3a3a3a] px-3 py-1.5 rounded border border-[#444444]">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-xs">
              Автообновление каждые 15 секунд
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatUptime = (uptime: string): string => {
  try {
    const [timePart] = uptime.split(".");
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  } catch (error) {
    console.error("Error parsing uptime:", error);
    return uptime;
  }
};

export default ServerMonitoring;
