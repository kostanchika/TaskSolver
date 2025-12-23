// /src/components/tasks/TaskPage.tsx
import { useState, useEffect } from "react";
import { ProgrammingTaskDto } from "../../api/programming-tasks/types";
import { ProgrammingLanguageDto } from "../../api/programming-languages/types";
import { MonacoCodeEditor } from "./Editor/MonacoCodeEditor";
import { SolutionHistory } from "./SolutionHistory";
import { programmingTasksApi } from "../../api/programming-tasks/programming-tasks";
import { programmingLanguagesApi } from "../../api/programming-languages/programming-languages";
import { useNavigate, useParams } from "react-router-dom";
import { CommentsSection } from "../Comments/CommentsSection";
import { TaskRating } from "./TaskRating";
import { solutionsApi } from "../../api/solutions/solutions";
import { useSignalR } from "../../hooks/useSignalR";
import ConsultingWidget from "../ConsultingWidget";

export const TaskPage = () => {
  const [activeTab, setActiveTab] = useState<
    "description" | "solutions" | "tests"
  >("description");
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [languages, setLanguages] = useState<ProgrammingLanguageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState<ProgrammingTaskDto | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (taskId) {
          const taskResponse = await programmingTasksApi.getById(taskId);
          setTask(taskResponse.data);
        }

        // Fetch programming languages
        const languagesResponse = await programmingLanguagesApi.getAll();
        setLanguages(languagesResponse.data);

        // Set default language
        if (
          languagesResponse.data.length > 0 &&
          !localStorage.getItem(`task:${taskId}`)
        ) {
          setLanguage(languagesResponse.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const hubUrl = `${import.meta.env.VITE_API_URL}/solutionsHub`;
  useSignalR({
    url: hubUrl,
    onSolutionCompleted: () => setActiveTab("solutions"),
  });

  useEffect(() => {
    if (code) {
      localStorage.setItem(`task:${taskId}:${language}`, code);
    }
  }, [code]);

  useEffect(() => {
    const code = localStorage.getItem(`task:${taskId}:${language}`);

    setCode(code ?? "");
  }, [taskId, language]);

  useEffect(() => {
    if (language) {
      localStorage.setItem(`task:${taskId}`, language);
    }
  }, [language]);

  useEffect(() => {
    const language = localStorage.getItem(`task:${taskId}`);

    if (language) {
      setLanguage(language);

      const code = localStorage.getItem(`task:${taskId}:${language}`);

      if (code) {
        setCode(code);
      }
    }
  }, [taskId]);

  const onBack = () => {
    navigate("/");
  };

  const handleSubmit = async () => {
    if (!taskId || !language) return;

    setIsSubmitting(true);
    try {
      await solutionsApi.create(taskId, language, code);
    } catch {
      alert("Ошибка при отправке решения");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (degree: number) => {
    const colors = {
      0: "text-emerald-400",
      1: "text-green-400",
      2: "text-yellow-400",
      3: "text-orange-400",
      4: "text-red-400",
      5: "text-purple-400",
      6: "text-indigo-400",
      7: "text-pink-400",
    };
    return colors[degree as keyof typeof colors] || "text-gray-400";
  };

  const getDifficultyBgColor = (degree: number) => {
    const colors = {
      0: "bg-emerald-500/20 border-emerald-500/50",
      1: "bg-green-500/20 border-green-500/50",
      2: "bg-yellow-500/20 border-yellow-500/50",
      3: "bg-orange-500/20 border-orange-500/50",
      4: "bg-red-500/20 border-red-500/50",
      5: "bg-purple-500/20 border-purple-500/50",
      6: "bg-indigo-500/20 border-indigo-500/50",
      7: "bg-pink-500/20 border-pink-500/50",
    };
    return (
      colors[degree as keyof typeof colors] ||
      "bg-gray-500/20 border-gray-500/50"
    );
  };

  const getDifficultyText = (degree: number) => {
    const names = {
      0: "Sigil0",
      1: "Sigil1",
      2: "Sigil2",
      3: "Sigil3",
      4: "Sigil4",
      5: "Sigil5",
      6: "Sigil6",
      7: "Sigil7",
    };
    return names[degree as keyof typeof names] || "Неизвестно";
  };

  const getLanguageName = (languageId: string) => {
    const lang = languages.find((l) => l.id === languageId);
    return lang ? `${lang.name} ${lang.version}` : languageId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white font-mono">Загрузка задачи...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#252525] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-mono mb-4">Задача не найдена</div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] transition-colors font-mono"
          >
            Вернуться к каталогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] text-white">
      {/* Header */}
      <div className="border-b border-[#333333] bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-mono group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>К каталогу</span>
              </button>

              <div className="h-6 w-px bg-[#333333]"></div>

              <div>
                <h1 className="text-2xl font-bold text-white font-mono">
                  {task.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400 font-mono">
                  <span
                    className={`px-2 py-1 rounded-full border ${getDifficultyBgColor(
                      task.degree
                    )} ${getDifficultyColor(task.degree)}`}
                  >
                    {getDifficultyText(task.degree)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmit}
                disabled={!language || isSubmitting}
                className="px-6 py-3 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] disabled:bg-[#333333] disabled:cursor-not-allowed transition-colors font-mono border border-[#e85353] disabled:border-[#333333]"
              >
                {isSubmitting ? "Отправка..." : "Отправить решение"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Task Description & Info */}
          <div className="space-y-6">
            {/* Task Tabs */}
            <div className="bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg">
              <div className="border-b border-[#333333]">
                <nav className="flex">
                  {[
                    { id: "description" as const, name: "Условие" },
                    { id: "solutions" as const, name: "История решений" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors font-mono ${
                        activeTab === tab.id
                          ? "border-[#e85353] text-[#e85353]"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "description" && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white font-mono mb-4">
                        Условие задачи
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Expected Output */}
                    {task.output && (
                      <div>
                        <h4 className="font-semibold text-white font-mono mb-3">
                          Ожидаемый вывод
                        </h4>
                        <div className="bg-[#2d2d2d] rounded-lg p-4 border border-[#333333]">
                          <p className="text-gray-300 font-mono">
                            {task.output}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Input/Output */}
                    {task.input && task.input.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white font-mono mb-3">
                          Входные данные
                        </h4>
                        <div className="bg-[#2d2d2d] rounded-lg p-4 border border-[#333333] overflow-x-auto">
                          <table className="w-full font-mono text-sm">
                            <thead>
                              <tr className="border-b border-[#333333]">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                  Параметр
                                </th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                  Тип
                                </th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                  Ограничения
                                </th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                                  Описание
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {task.input.map((input, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-[#333333] hover:bg-[#2f2f2f] transition-colors"
                                >
                                  <td className="py-3 px-4 text-gray-300 font-medium">
                                    {input.name}
                                  </td>
                                  <td className="py-3 px-4 text-gray-300">
                                    {input.type}
                                  </td>
                                  <td className="py-3 px-4 text-gray-300">
                                    {input.constraints || "-"}
                                  </td>
                                  <td className="py-3 px-4 text-gray-300">
                                    {input.description || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Examples */}
                    {task.examples && task.examples.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white font-mono mb-4">
                          Примеры
                        </h4>
                        <div className="space-y-4">
                          {task.examples.map((example, index) => (
                            <div
                              key={index}
                              className="bg-[#2d2d2d] rounded-xl border border-[#333333] overflow-hidden"
                            >
                              <div className="bg-[#333333] px-4 py-3 text-sm font-medium font-mono">
                                Пример {index + 1}
                              </div>
                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-400 mb-2 font-mono">
                                      Входные данные:
                                    </div>
                                    <pre className="bg-[#252525] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono border border-[#333333]">
                                      {example.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-400 mb-2 font-mono">
                                      Выходные данные:
                                    </div>
                                    <pre className="bg-[#252525] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono border border-[#333333]">
                                      {example.output}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hints */}
                    {task.hints && task.hints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white font-mono mb-4">
                          Подсказки
                        </h4>
                        <div className="space-y-3">
                          {task.hints.map((hint, index) => (
                            <div
                              key={index}
                              className="bg-[#2d2d2d] rounded-lg p-4 border border-[#333333]"
                            >
                              <div className="text-gray-300 text-sm font-mono">
                                <span className="font-semibold text-[#e85353] uppercase tracking-wide">
                                  Подсказка {index + 1}:
                                </span>{" "}
                                {hint}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tests Info */}
                    {task.tests && task.tests.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white font-mono mb-3">
                          Информация о тестах
                        </h4>
                        <div className="bg-[#2d2d2d] rounded-lg p-4 border border-[#333333]">
                          <div className="flex items-center space-x-6 text-sm text-gray-300 font-mono">
                            <span>Всего тестов: {task.tests.length}</span>
                            <span>
                              Публичные:{" "}
                              {task.tests.filter((t) => t.isPublic).length}
                            </span>
                            <span>
                              Скрытые:{" "}
                              {task.tests.filter((t) => !t.isPublic).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "solutions" && taskId && (
                  <SolutionHistory
                    taskId={taskId}
                    languages={languages}
                    onTaskSolved={() => {
                      /* Callback when task is solved */
                    }}
                  />
                )}
              </div>
            </div>

            {/* Keywords */}
            {task.keywords && task.keywords.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333]">
                <h4 className="font-semibold text-white font-mono mb-3">
                  Ключевые слова
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-[#2d2d2d] text-gray-300 text-sm px-3 py-2 rounded-lg border border-[#333333] font-mono"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="space-y-6">
            {/* Language Selector */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 font-mono">
                  Язык программирования{" "}
                  <span className="text-[#e85353]">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#2d2d2d] border border-[#333333] rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353] transition-colors min-w-64"
                  disabled={languages.length === 0}
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} {lang.version}
                    </option>
                  ))}
                </select>
              </div>
              {languages.length === 0 && (
                <p className="text-red-400 text-sm mt-3 font-mono">
                  Языки программирования не загружены
                </p>
              )}
            </div>

            {/* Code Editor */}
            <div className="bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg overflow-hidden">
              <div className="bg-[#2d2d2d] px-6 py-4 text-sm font-medium border-b border-[#333333] flex justify-between items-center">
                <span className="text-white font-mono">Редактор кода</span>
                {language && (
                  <span className="text-gray-400 text-sm font-mono">
                    {getLanguageName(language)}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <MonacoCodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  height="500px"
                  languages={languages}
                  theme={"vs-dark"}
                  onEditorReady={() => {}}
                />
              </div>
            </div>

            {/* Task Rating */}
            {taskId && <TaskRating taskId={taskId} />}

            {/* Task Metadata */}
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg">
              <h4 className="font-semibold mb-4 text-white font-mono">
                Информация о задаче
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-mono">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-gray-300 ml-2 font-medium">
                    {task.id}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-gray-400">Сложность:</span>
                  <span
                    className={`ml-2 font-medium ${getDifficultyColor(
                      task.degree
                    )}`}
                  >
                    {getDifficultyText(task.degree)} ({task.degree})
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-gray-400">Примеров:</span>
                  <span className="text-gray-300 ml-2 font-medium">
                    {task.examples?.length || 0}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-gray-400">Тестов:</span>
                  <span className="text-gray-300 ml-2 font-medium">
                    {task.tests?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          {taskId && (
            <CommentsSection
              taskId={taskId}
              currentUserId={localStorage.getItem("userId") ?? ""}
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {taskId && <ConsultingWidget taskId={taskId} />}
      </div>
    </div>
  );
};
