// components/Header.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserProfileWithRating } from "./UserProfileWithRating";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminMenuItems = [
    { path: "/admin/languages", label: "Языки программирования" },
    { path: "/admin/tasks", label: "Задачи" },
    { path: "/admin/users", label: "Пользователи" },
    { path: "/admin/statistics", label: "Статистика" },
    { path: "/admin/resources", label: "Ресурсы" },
    { path: "/admin/logs", label: "Логи" },
  ];

  const handleAdminItemClick = (path: string) => {
    navigate(path);
    setIsAdminMenuOpen(false);
  };

  const isActiveRoute = (path: string) => location.pathname === path;
  const isAdminRoute = () => location.pathname.startsWith("/admin");

  return (
    <header className="bg-[#252525] border-b border-[#333333] px-8 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-10">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-[#e85353] rounded-xl flex items-center justify-center group-hover:bg-[#d64242] transition-all duration-300">
              <span className="text-white font-mono font-bold text-base">
                {"</>"}
              </span>
            </div>
            <span className="text-white font-mono text-2xl font-bold">
              DevHub
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {!isAdmin && (
              <div
                onClick={() => navigate("/")}
                className={`font-mono text-sm py-2 px-1 cursor-pointer transition-colors ${
                  isActiveRoute("/")
                    ? "text-[#e85353] border-b-2 border-[#e85353]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Главная
              </div>
            )}

            {!isAdmin && (
              <div
                onClick={() => navigate("/leaderboard")}
                className={`font-mono text-sm py-2 px-1 cursor-pointer transition-colors ${
                  isActiveRoute("/leaderboard")
                    ? "text-[#e85353] border-b-2 border-[#e85353]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Лидерборд
              </div>
            )}

            {!isAdmin && (
              <div
                onClick={() => navigate("/matchmaking")}
                className={`font-mono text-sm py-2 px-1 cursor-pointer transition-colors ${
                  isActiveRoute("/matchmaking")
                    ? "text-[#e85353] border-b-2 border-[#e85353]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Соревнования
              </div>
            )}

            {isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <div
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  onMouseEnter={() => setIsAdminMenuOpen(true)}
                  className={`font-mono text-sm py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                    isAdminRoute()
                      ? "text-[#e85353] bg-[#e85353]/10"
                      : "text-gray-400 hover:text-white hover:bg-[#333333]"
                  }`}
                >
                  Админка
                  <svg
                    className={`w-4 h-4 ml-1 inline transition-transform ${
                      isAdminMenuOpen ? "rotate-180" : ""
                    }`}
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

                {isAdminMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-[#2a2a2a] border border-[#333333] rounded-xl shadow-xl z-50 py-2"
                    onMouseLeave={() => setIsAdminMenuOpen(false)}
                  >
                    {adminMenuItems.map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleAdminItemClick(item.path)}
                        className={`px-4 py-3 font-mono text-sm cursor-pointer transition-colors hover:bg-[#333333] hover:text-[#e85353] ${
                          location.pathname === item.path
                            ? "text-[#e85353] bg-[#e85353]/10"
                            : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        <UserProfileWithRating />
      </div>
    </header>
  );
};
