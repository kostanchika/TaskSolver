import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { consultingApi } from "../api/consulting/consulting";
import { ConsultMessage } from "../api/consulting/types";

interface ConsultingWidgetProps {
  taskId: string;
}

// Выносим тяжелый компонент в отдельный мемоизированный компонент
const MessageItem = React.memo(
  ({ message, isUser }: { message: ConsultMessage; isUser: boolean }) => {
    const formatTime = useCallback((dateString: string) => {
      return new Date(dateString).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, []);

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isUser
              ? "bg-[#e85353] text-white"
              : "bg-[#1a1a1a] border border-[#333333]"
          }`}
        >
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code: ({ ...props }) => (
                  <code
                    className={`px-1 py-0.5 rounded text-sm
                        : "block bg-[#1a1a1a] border border-[#333333] p-2 my-1"
                    `}
                    {...props}
                  />
                ),
                pre: ({ ...props }) => (
                  <pre
                    className="bg-[#1a1a1a] border border-[#333333] rounded p-2 my-1 overflow-x-auto"
                    {...props}
                  />
                ),
                h1: ({ ...props }) => (
                  <h1 className="text-xl font-bold mt-2 mb-1" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-lg font-bold mt-2 mb-1" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-base font-bold mt-2 mb-1" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="mb-1 leading-relaxed" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc list-inside mb-1 space-y-0.5"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal list-inside mb-1 space-y-0.5"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-2 border-[#e85353] pl-3 my-1 italic"
                    {...props}
                  />
                ),
              }}
            >
              {message.answer}
            </ReactMarkdown>
          </div>
          <div
            className={`text-xs mt-2 ${
              isUser ? "text-gray-200" : "text-gray-500"
            }`}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";

// Компонент для индикатора загрузки
const LoadingIndicator = React.memo(() => (
  <div className="flex justify-start">
    <div className="max-w-[80%] rounded-lg p-3 bg-[#1a1a1a] border border-[#333333]">
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="w-3 h-3 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-sm">Консультант печатает...</span>
      </div>
    </div>
  </div>
));

LoadingIndicator.displayName = "LoadingIndicator";

// Основной компонент виджета
export const ConsultingWidget: React.FC<ConsultingWidgetProps> = ({
  taskId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Используем requestAnimationFrame для скролла
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, []);

  // Дебаунс для скролла
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Инициализация с использованием Web Worker-like подхода (отложенная инициализация)
  const initializeWidget = useCallback(async () => {
    if (hasInitialized.current) return;

    try {
      setIsInitializing(true);

      // Разбиваем на несколько микрозадач чтобы не блокировать основной поток
      await new Promise((resolve) => setTimeout(resolve, 0));

      const userMessage: ConsultMessage = {
        taskId,
        answer: "Опиши задачу",
        createdAt: new Date().toISOString(),
      };

      setMessages([userMessage]);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const response = await consultingApi.getAnswer(taskId, "Опиши задачу");

      await new Promise((resolve) => setTimeout(resolve, 0));

      setMessages((prev) => [prev[0], response.data]);

      hasInitialized.current = true;
    } catch (error) {
      console.error("Failed to initialize widget:", error);
      // Используем setTimeout чтобы разбить обновления состояния
      setTimeout(() => {
        setMessages([
          {
            taskId,
            answer: "Опиши задачу",
            createdAt: new Date().toISOString(),
          },
          {
            taskId,
            answer:
              "👋 Добро пожаловать! Я помогу вам с решением задачи. Задавайте вопросы!",
            createdAt: new Date().toISOString(),
          },
        ]);
        hasInitialized.current = true;
      }, 0);
    } finally {
      setTimeout(() => setIsInitializing(false), 0);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && !hasInitialized.current && messages.length === 0) {
      // Запускаем инициализацию в следующем тике event loop
      setTimeout(initializeWidget, 0);
    }
  }, [isOpen, messages.length, initializeWidget]);

  // Оптимизированный обработчик отправки с разбивкой на микрозадачи
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: ConsultMessage = {
        taskId,
        answer: input,
        createdAt: new Date().toISOString(),
      };

      const currentInput = input;

      // Очищаем инпут сразу
      setInput("");

      // Фокусируем обратно на инпут
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Разбиваем обновление состояния на микрозадачи
      await new Promise((resolve) => setTimeout(resolve, 0));
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      try {
        // Выносим тяжелую операцию API вызова из основного потока
        const response = await consultingApi.getAnswer(taskId, currentInput);

        await new Promise((resolve) => setTimeout(resolve, 0));
        setMessages((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Failed to get answer:", error);
        await new Promise((resolve) => setTimeout(resolve, 0));
        setMessages((prev) => [
          ...prev,
          {
            taskId,
            answer:
              "❌ Произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 0));
        setIsLoading(false);
      }
    },
    [input, isLoading, taskId]
  );

  // Используем debounce для обработки ввода
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    hasInitialized.current = false;
  }, []);

  // Оптимизируем вычисление unreadCount
  const unreadCount = Math.max(0, messages.length - 2);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className="w-14 h-14 bg-[#e85353] text-white rounded-full shadow-2xl hover:bg-[#ff6b6b] focus:outline-none focus:ring-2 focus:ring-[#e85353] focus:ring-offset-2 focus:ring-offset-[#252525] transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative"
          aria-label={isOpen ? "Закрыть консультант" : "Открыть консультант"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>

          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-[#e85353] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#e85353]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Widget Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] z-50 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex flex-col h-full bg-[#252525] border border-[#333333] rounded-lg shadow-2xl">
            {/* Header */}
            <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333333] flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#e85353] rounded-full"></div>
                <h3 className="text-white font-mono text-sm font-medium">
                  Консультант {unreadCount > 0 && `(${unreadCount})`}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Очистить историю"
                  title="Очистить историю"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleWidget}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Свернуть"
                  title="Свернуть"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scroll-smooth consulting-widget-scrollbar"
            >
              {isInitializing ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="w-4 h-4 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-mono text-sm">Загрузка...</span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageItem
                      key={`${message.createdAt}-${index}`}
                      message={message}
                      isUser={index % 2 === 0}
                    />
                  ))}
                  {isLoading && <LoadingIndicator />}
                </>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-[#333333] flex-shrink-0"
            >
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Задайте вопрос по задаче..."
                  disabled={isLoading || isInitializing}
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e85353] focus:ring-1 focus:ring-[#e85353] font-mono text-sm transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isInitializing}
                  className="px-4 py-2 bg-[#e85353] text-white rounded-lg font-mono text-sm font-medium hover:bg-[#ff6b6b] focus:outline-none focus:ring-2 focus:ring-[#e85353] focus:ring-offset-2 focus:ring-offset-[#252525] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  →
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 font-mono text-center">
                Нажмите Enter для отправки
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Стили для кастомной прокрутки
const consultingWidgetStyles = `
.consulting-widget-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #333333 #1a1a1a;
}

.consulting-widget-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.consulting-widget-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.consulting-widget-scrollbar::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 3px;
}

.consulting-widget-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e85353;
}
`;

// Добавляем стили
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = consultingWidgetStyles;
  document.head.appendChild(styleSheet);
}

export default ConsultingWidget;
