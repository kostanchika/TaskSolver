// /src/components/auth/PasswordReset.tsx
import React, { useState } from "react";
import { authApi } from "../../api/auth/auth";
import {
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from "../../api/auth/types";

interface PasswordResetProps {
  onBack: () => void;
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

export const PasswordReset: React.FC<PasswordResetProps> = ({ onBack }) => {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [requestData, setRequestData] = useState<RequestPasswordResetRequest>({
    email: "",
  });

  const [resetData, setResetData] = useState<ResetPasswordRequest>({
    email: "",
    code: "",
    password: "",
  });

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await authApi.requestPasswordReset(requestData);
      setSuccess("Код восстановления отправлен на вашу почту");
      setStep("reset");
      setResetData((prev) => ({ ...prev, email: requestData.email || "" }));
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await authApi.resetPassword(resetData);
      setSuccess("Пароль успешно изменен");
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (err: unknown) => {
    const errFormatted = err as { response: { data: ApiError } };
    if (errFormatted.response?.data) {
      const errorData: ApiError = errFormatted.response.data;

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
    request: `// Password Reset Request
await authService.requestPasswordReset({
  email: "${requestData.email || "user@example.com"}"
});

// Sending recovery code via email
emailService.send({
  to: user.email,
  subject: 'Password Recovery',
  template: 'password-reset',
  code: generateRecoveryCode()
});`,

    reset: `// Password Reset Completion
await authService.resetPassword({
  email: "${resetData.email || "user@example.com"}",
  code: "${resetData.code || "••••••"}",
  password: "••••••••"
});

// Update user credentials
await database.updateUser(userId, {
  password: hashPassword(newPassword),
  updatedAt: new Date().toISOString()
});`,
  };

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
              {step === "request" ? "recovery-service.ts" : "auth-service.ts"}
            </span>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            <pre className="text-gray-300 font-mono text-sm leading-relaxed">
              <code>
                {step === "request" ? codeSnippets.request : codeSnippets.reset}
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
                <span>npm run auth:recovery:{step}</span>
              </div>
              <div className="text-green-400 flex items-center space-x-2 mt-1">
                <span>✓</span>
                <span className="text-gray-300">
                  {step === "request"
                    ? "Sending recovery code..."
                    : "Updating credentials..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Forms */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <button
            onClick={onBack}
            className="self-start mb-6 text-gray-400 hover:text-white transition-colors font-mono text-sm flex items-center space-x-2"
          >
            <span>←</span>
            <span>Назад к авторизации</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-mono">
              {step === "request" ? "Восстановление пароля" : "Сброс пароля"}
            </h1>
            <p className="text-gray-400 mt-2 font-mono">
              {step === "request"
                ? "Введите ваш email для получения кода восстановления"
                : "Введите код и новый пароль"}
            </p>
          </div>

          {success && (
            <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <span>✓</span>
                <span className="font-mono text-sm">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-[#e85353]/20 border border-[#e85353] text-red-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <span>⚠</span>
                <span className="font-mono text-sm">{error}</span>
              </div>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
                >
                  <span>Email адрес</span>
                  <span className="text-gray-500 text-xs">string</span>
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  value={requestData.email}
                  onChange={(e) => {
                    setRequestData({ email: e.target.value });
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
                    <span>Отправка кода...</span>
                  </>
                ) : (
                  <span>Отправить код восстановления</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="reset-email"
                  className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
                >
                  <span>Email адрес</span>
                  <span className="text-gray-500 text-xs">string</span>
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetData.email}
                  onChange={(e) => {
                    setResetData({ ...resetData, email: e.target.value });
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
                  htmlFor="reset-code"
                  className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
                >
                  <span>Код восстановления</span>
                  <span className="text-gray-500 text-xs">string</span>
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={resetData.code}
                  onChange={(e) => {
                    setResetData({ ...resetData, code: e.target.value });
                    clearFieldError("code");
                  }}
                  className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 font-mono text-sm transition-colors ${
                    fieldErrors.code
                      ? "border-[#e85353] focus:border-[#e85353] focus:ring-[#e85353]"
                      : "border-[#333333] focus:border-[#e85353] focus:ring-[#e85353]"
                  }`}
                  placeholder="Введите 6-значный код"
                  required
                />
                {fieldErrors.code && (
                  <p className="text-[#e85353] text-xs mt-1 font-mono flex items-center space-x-1">
                    <span>❌</span>
                    <span>{fieldErrors.code}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="flex justify-between items-center text-sm font-medium text-gray-300 mb-2 font-mono"
                >
                  <span>Новый пароль</span>
                  <span className="text-gray-500 text-xs">string</span>
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={resetData.password}
                  onChange={(e) => {
                    setResetData({ ...resetData, password: e.target.value });
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
                    <span>Сброс пароля...</span>
                  </>
                ) : (
                  <span>Сбросить пароль</span>
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-8">
            <span className="text-gray-400 font-mono text-sm">
              Вспомнили пароль?{" "}
              <button
                type="button"
                className="text-[#e85353] hover:text-[#ff6b6b] underline transition-colors duration-200 font-mono"
                onClick={onBack}
              >
                Вернуться к входу
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
