// /src/components/auth/AuthForms.tsx (обновленная версия)
import React, { useState } from "react";
import { authApi } from "../../api/auth/auth";
import {
  RegisterViaPasswordRequest,
  LoginViaPasswordRequest,
} from "../../api/auth/types";
import { PasswordReset } from "./PasswordReset";
import { useAuth } from "../../hooks/useAuth";

interface AuthFormsProps {
  onSuccess?: () => void;
}

interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: {
    [key: string]: string[];
  };
}

type AuthMode = "login" | "register" | "passwordReset";

const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { saveTokens } = useAuth();

  const [loginData, setLoginData] = useState<LoginViaPasswordRequest>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterViaPasswordRequest>({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await authApi.login(loginData);
      console.log("Login successful:", response.data);
      saveTokens(response.data);
      onSuccess?.();
      window.location.href = "/";
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await authApi.register(registerData);
      console.log("Registration successful:", response.data);
      saveTokens(response.data);
      onSuccess?.();
      window.location.href = "/";
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (err: unknown) => {
    const errFormatter = err as { response: { data: ApiError } };
    if (errFormatter.response?.data) {
      const errorData: ApiError = errFormatter.response.data;

      if (errorData.errors) {
        const newFieldErrors: { [key: string]: string } = {};

        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (messages.length > 0) {
            newFieldErrors[field] = messages.join(", ");
          }
        });

        setFieldErrors(newFieldErrors);

        if (Object.keys(newFieldErrors).length > 0) {
          setError("Пожалуйста, исправьте ошибки в форме");
        }
      } else {
        setError(errorData.detail || "Произошла ошибка");
      }
    } else {
      setError("Произошла неизвестная ошибка");
    }
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const codeSnippets = {
    login: `// User Authentication Module
const user = await authService.login({
  email: "${loginData.email || "user@example.com"}",
  password: "••••••••"
});

if (user) {
  dispatch({ type: 'AUTH_SUCCESS', payload: user });
  router.push('/dashboard');
}`,

    register: `// New User Registration
const newUser = await authService.register({
  email: "${registerData.email || "newuser@example.com"}",
  password: "••••••••"
});

await database.createUser({
  id: generateId(),
  email: newUser.email,
  createdAt: new Date().toISOString(),
  status: 'pending_verification'
});`,
  };

  // Если выбран режим восстановления пароля, показываем соответствующий компонент
  if (mode === "passwordReset") {
    return <PasswordReset onBack={() => setMode("login")} />;
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#252525] via-[#1a1a1a] to-[#252525] flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-[#252525] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
        {/* Left side - Code display */}
        <div className="bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
          <div className="bg-[#252525] px-6 py-3 border-b border-[#333333] flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-[#e85353] rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm font-mono">
              {isLogin ? "auth-service.ts" : "user-service.ts"}
            </span>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <pre className="text-gray-300 font-mono text-sm leading-relaxed">
              <code>
                {isLogin ? codeSnippets.login : codeSnippets.register}
              </code>
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
                <span>npm run auth:{isLogin ? "login" : "register"}</span>
              </div>
              <div className="text-green-400 flex items-center space-x-2 mt-1">
                <span>✓</span>
                <span className="text-gray-300">
                  {isLoading
                    ? isLogin
                      ? "Authenticating user..."
                      : "Creating user profile..."
                    : isLogin
                    ? "User session initialized"
                    : "User profile created"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Forms */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-mono">
              {isLogin ? "Вход в систему" : "Создать аккаунт"}
            </h1>
            <p className="text-gray-400 mt-2 font-mono">
              {isLogin
                ? "Доступ к панели разработчика"
                : "Начните свой путь в программировании"}
            </p>
          </div>

          {error && (
            <div className="bg-[#e85353]/20 border border-[#e85353] text-red-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <span>⚠</span>
                <span className="font-mono text-sm">{error}</span>
              </div>
            </div>
          )}

          <form
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
              >
                <span>Email</span>
                <span className="text-gray-500 text-xs">string</span>
              </label>
              <input
                id="email"
                type="email"
                value={isLogin ? loginData.email : registerData.email}
                onChange={(e) => {
                  if (isLogin) {
                    setLoginData({ ...loginData, email: e.target.value });
                  } else {
                    setRegisterData({ ...registerData, email: e.target.value });
                  }
                  clearFieldError("email");
                }}
                className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 font-mono text-sm transition-colors ${
                  fieldErrors.email
                    ? "border-[#e85353] focus:border-[#e85353] focus:ring-[#e85353]"
                    : "border-[#333333] focus:border-[#e85353] focus:ring-[#e85353]"
                }`}
                placeholder="developer@example.com"
                required
              />
              {fieldErrors.email && (
                <p className="text-[#e85353] text-xs mt-1 font-mono flex items-center space-x-1">
                  <span>❌</span>
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
              >
                <span>Пароль</span>
                <span className="text-gray-500 text-xs">string</span>
              </label>
              <input
                id="password"
                type="password"
                value={isLogin ? loginData.password : registerData.password}
                onChange={(e) => {
                  if (isLogin) {
                    setLoginData({ ...loginData, password: e.target.value });
                  } else {
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    });
                  }
                  clearFieldError("password");
                }}
                className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 font-mono text-sm transition-colors ${
                  fieldErrors.password
                    ? "border-[#e85353] focus:border-[#e85353] focus:ring-[#e85353]"
                    : "border-[#333333] focus:border-[#e85353] focus:ring-[#e85353]"
                }`}
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && (
                <p className="text-[#e85353] text-xs mt-1 font-mono flex items-center space-x-1">
                  <span>❌</span>
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("passwordReset")}
                  className="text-[#e85353] hover:text-[#ff6b6b] text-sm font-mono transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium font-mono text-sm transition-all duration-200 ${
                isLoading
                  ? "bg-[#e85353] cursor-not-allowed opacity-80"
                  : "bg-[#e85353] hover:bg-[#ff6b6b] transform hover:scale-[1.02]"
              } text-white focus:outline-none focus:ring-2 focus:ring-[#e85353] focus:ring-offset-2 focus:ring-offset-[#252525] flex items-center justify-center space-x-2`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {isLogin ? "Авторизация..." : "Создание аккаунта..."}
                  </span>
                </>
              ) : (
                <span>{isLogin ? "Войти в систему" : "Создать аккаунт"}</span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#252525] text-gray-400 font-mono">
                или продолжите с
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#1a1a1a] hover:bg-[#333333] border border-[#333333] rounded-lg text-gray-300 font-mono text-sm transition-all duration-200 hover:scale-[1.02]"
              onClick={() => authApi.signinGithub()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#1a1a1a] hover:bg-[#333333] border border-[#333333] rounded-lg text-gray-300 font-mono text-sm transition-all duration-200 hover:scale-[1.02]"
              onClick={() => authApi.signinGoogle()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <div className="text-center mt-8">
            <span className="text-gray-400 font-mono text-sm">
              {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
              <button
                type="button"
                className="text-[#e85353] hover:text-[#ff6b6b] underline transition-colors duration-200 font-mono hover:scale-105 transform"
                onClick={() => {
                  setMode(isLogin ? "register" : "login");
                  setError("");
                  setFieldErrors({});
                }}
              >
                {isLogin ? "Зарегистрироваться" : "Войти"}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
