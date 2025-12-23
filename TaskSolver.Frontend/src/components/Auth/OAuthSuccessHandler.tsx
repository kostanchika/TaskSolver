import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const OAuthSuccessHandler = () => {
  const navigate = useNavigate();
  const { saveTokens } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const accessToken = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");
      const userId = urlParams.get("userId");
      const role = urlParams.get("role");

      if (!accessToken || !refreshToken || !userId || !role) {
        throw new Error("Missing authentication data");
      }

      // Сохраняем токены в localStorage
      saveTokens({
        accessToken,
        refreshToken,
        userId,
        role,
      });

      setStatus("success");

      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("OAuth callback error:", error);
      setStatus("error");

      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 3000);
    }
  };

  const codeSnippet = `// OAuth Callback Handler
const urlParams = new URLSearchParams(window.location.search);
const tokens = {
  accessToken: urlParams.get('accessToken'),
  refreshToken: urlParams.get('refreshToken'), 
  userId: urlParams.get('userId')
};

if (tokens.accessToken && tokens.refreshToken && tokens.userId) {
  authService.saveTokens(tokens);
  router.replace('/dashboard');
} else {
  throw new Error('Invalid OAuth response');
}`;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#252525] via-[#1a1a1a] to-[#252525] flex items-center justify-center p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-[#252525] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
            <div className="bg-[#252525] px-6 py-3 border-b border-[#333333] flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#e85353] rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">
                oauth-handler.ts
              </span>
            </div>
            <div className="flex-1 p-8 overflow-auto">
              <pre className="text-gray-300 font-mono text-sm leading-relaxed">
                <code>{codeSnippet}</code>
              </pre>
            </div>
            <div className="bg-black border-t border-[#333333]">
              <div className="bg-[#252525] px-6 py-2 border-b border-[#333333] flex justify-between items-center">
                <span className="text-gray-400 text-xs font-mono">
                  terminal
                </span>
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-green-400 flex items-center space-x-2">
                  <span>$</span>
                  <span>Обработка OAuth callback...</span>
                </div>
                <div className="text-yellow-400 flex items-center space-x-2 mt-1">
                  <span>⏳</span>
                  <span className="text-gray-300">Проверка токенов...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 border-4 border-[#e85353] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-mono mb-4">
              Обработка авторизации
            </h1>
            <p className="text-gray-400 font-mono">
              Завершение OAuth потока...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#252525] via-[#1a1a1a] to-[#252525] flex items-center justify-center p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-[#252525] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
            <div className="bg-[#252525] px-6 py-3 border-b border-[#333333] flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#e85353] rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">
                oauth-handler.ts
              </span>
            </div>
            <div className="flex-1 p-8 overflow-auto">
              <pre className="text-[#e85353] font-mono text-sm leading-relaxed">
                <code>{`// OAuth Error
throw new Error('OAuth authentication failed');

// Possible causes:
// - Missing tokens in URL parameters
// - Invalid token format
// - Network connectivity issues
// - Server authentication failure`}</code>
              </pre>
            </div>
            <div className="bg-black border-t border-[#333333]">
              <div className="bg-[#252525] px-6 py-2 border-b border-[#333333] flex justify-between items-center">
                <span className="text-gray-400 text-xs font-mono">
                  terminal
                </span>
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="text-[#e85353] flex items-center space-x-2">
                  <span>$</span>
                  <span>Ошибка обработки OAuth</span>
                </div>
                <div className="text-[#e85353] flex items-center space-x-2 mt-1">
                  <span>❌</span>
                  <span className="text-gray-300">
                    Перенаправление на вход...
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-[#e85353] rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-mono mb-4">
              Ошибка авторизации
            </h1>
            <p className="text-gray-400 font-mono mb-6">
              Возникла проблема с OAuth авторизацией.
            </p>
            <p className="text-gray-500 font-mono text-sm">
              Перенаправление на страницу входа...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#252525] via-[#1a1a1a] to-[#252525] flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-[#252525] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
          <div className="bg-[#252525] px-6 py-3 border-b border-[#333333] flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-[#e85353] rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm font-mono">
              oauth-handler.ts
            </span>
          </div>
          <div className="flex-1 p-8 overflow-auto">
            <pre className="text-green-300 font-mono text-sm leading-relaxed">
              <code>{`// OAuth Success
const tokens = {
  accessToken: '${new URLSearchParams(window.location.search)
    .get("accessToken")
    ?.substring(0, 20)}...',
  refreshToken: '${new URLSearchParams(window.location.search)
    .get("refreshToken")
    ?.substring(0, 20)}...',
  userId: '${new URLSearchParams(window.location.search).get("userId")}'
};

// Tokens saved to localStorage
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
localStorage.setItem('userId', tokens.userId);

// Authentication successful
console.log('OAuth flow completed successfully');`}</code>
            </pre>
          </div>
          <div className="bg-black border-t border-[#333333]">
            <div className="bg-[#252525] px-6 py-2 border-b border-[#333333] flex justify-between items-center">
              <span className="text-gray-400 text-xs font-mono">terminal</span>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
            <div className="p-4 font-mono text-sm">
              <div className="text-green-400 flex items-center space-x-2">
                <span>$</span>
                <span>OAuth авторизация успешна</span>
              </div>
              <div className="text-green-400 flex items-center space-x-2 mt-1">
                <span>✓</span>
                <span className="text-gray-300">
                  Перенаправление в систему...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white font-mono mb-4">
            Авторизация успешна
          </h1>
          <p className="text-gray-400 font-mono mb-6">
            Вы успешно авторизованы через OAuth.
          </p>
          <p className="text-gray-500 font-mono text-sm">
            Перенаправление в систему...
          </p>
        </div>
      </div>
    </div>
  );
};
