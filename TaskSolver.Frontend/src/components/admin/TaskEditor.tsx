import { useState, useEffect } from "react";
import {
  ProgrammingTaskDto,
  TaskDegree,
  TaskInputDto,
  TaskExampleDto,
  TaskTestDto,
  CreateProgrammingTaskRequest,
} from "../../api/programming-tasks/types";

interface TaskEditorProps {
  task?: ProgrammingTaskDto;
  onSave: (taskData: CreateProgrammingTaskRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type TabType = "basic" | "input" | "examples" | "tests";

export const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: task?.name || "",
    description: task?.description || "",
    degree: task?.degree === undefined ? TaskDegree.Medium : task?.degree,
    keywords: task?.keywords || [],
    output: task?.output || "",
    hints: task?.hints || [],
    input: task?.input || [],
    examples: task?.examples || [],
    tests: task?.tests || [],
  });

  useEffect(() => {
    setFormData({
      name: task?.name || "",
      description: task?.description || "",
      degree: task?.degree === undefined ? TaskDegree.Medium : task?.degree,
      keywords: task?.keywords || [],
      output: task?.output || "",
      hints: task?.hints || [],
      input: task?.input || [],
      examples: task?.examples || [],
      tests: task?.tests || [],
    });
  }, [task]);

  const [newKeyword, setNewKeyword] = useState("");
  const [newHint, setNewHint] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { id: "basic" as TabType, name: "Основное" },
    { id: "input" as TabType, name: "Входные данные" },
    { id: "examples" as TabType, name: "Примеры" },
    { id: "tests" as TabType, name: "Тесты" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Обязательное поле";
    if (!formData.description.trim())
      newErrors.description = "Обязательное поле";

    formData.input.forEach((input, index) => {
      if (!input.name.trim())
        newErrors[`input_${index}_name`] = "Обязательное поле";
      if (!input.type.trim())
        newErrors[`input_${index}_type`] = "Обязательное поле";
    });

    formData.examples.forEach((example, index) => {
      if (!example.input.trim())
        newErrors[`example_${index}_input`] = "Обязательное поле";
      if (!example.output.trim())
        newErrors[`example_${index}_output`] = "Обязательное поле";
    });

    formData.tests.forEach((test, index) => {
      if (!test.input.trim())
        newErrors[`test_${index}_input`] = "Обязательное поле";
      if (!test.output.trim())
        newErrors[`test_${index}_output`] = "Обязательное поле";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      name: formData.name || "",
      description: formData.description || "",
      degree: formData.degree,
      keywords: formData.keywords.length > 0 ? formData.keywords : [],
      output: formData.output || "",
      hints: formData.hints.length > 0 ? formData.hints : [],
      input: formData.input.length > 0 ? formData.input : [],
      examples: formData.examples.length > 0 ? formData.examples : [],
      tests: formData.tests.length > 0 ? formData.tests : [],
    };

    await onSave(taskData);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const addHint = () => {
    if (newHint.trim() && !formData.hints.includes(newHint.trim())) {
      setFormData((prev) => ({
        ...prev,
        hints: [...prev.hints, newHint.trim()],
      }));
      setNewHint("");
    }
  };

  const removeHint = (hintToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((hint) => hint !== hintToRemove),
    }));
  };

  const addInput = () => {
    setFormData((prev) => ({
      ...prev,
      input: [
        ...prev.input,
        { name: "", type: "", constraints: "", description: "" },
      ],
    }));
  };

  const updateInput = (
    index: number,
    field: keyof TaskInputDto,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      input: prev.input.map((input, i) =>
        i === index ? { ...input, [field]: value } : input
      ),
    }));
    if (errors[`input_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`input_${index}_${field}`]: "" }));
    }
  };

  const removeInput = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      input: prev.input.filter((_, i) => i !== index),
    }));
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "" }],
    }));
  };

  const updateExample = (
    index: number,
    field: keyof TaskExampleDto,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.map((example, i) =>
        i === index ? { ...example, [field]: value } : example
      ),
    }));
    if (errors[`example_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`example_${index}_${field}`]: "" }));
    }
  };

  const removeExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const addTest = () => {
    setFormData((prev) => ({
      ...prev,
      tests: [...prev.tests, { input: "", output: "", isPublic: true }],
    }));
  };

  const updateTest = (
    index: number,
    field: keyof TaskTestDto,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === index ? { ...test, [field]: value } : test
      ),
    }));
    if (errors[`test_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`test_${index}_${field}`]: "" }));
    }
  };

  const removeTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const getDifficultyName = (degree: TaskDegree): string => {
    const names = {
      [TaskDegree.VeryEasy]: "Очень легко",
      [TaskDegree.Easy]: "Легко",
      [TaskDegree.Medium]: "Средне",
      [TaskDegree.Hard]: "Сложно",
      [TaskDegree.VeryHard]: "Очень сложно",
      [TaskDegree.Expert]: "Эксперт",
      [TaskDegree.Master]: "Мастер",
      [TaskDegree.Legendary]: "Легендарно",
    };
    return names[degree];
  };

  return (
    <div className="bg-[#3a3a3a] rounded-lg border border-[#444444] mb-4">
      <div className="border-b border-[#444444] px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {task ? "Редактирование задачи" : "Новая задача"}
          </h3>
          <div className="text-sm text-gray-400">
            {formData.input.length} входов, {formData.examples.length} примеров,{" "}
            {formData.tests.length} тестов
          </div>
        </div>
      </div>

      <div className="border-b border-[#444444]">
        <nav className="flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
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

      <form onSubmit={handleSubmit} className="p-4">
        {activeTab === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full px-3 py-2 bg-[#444444] border rounded text-white focus:outline-none focus:border-[#e85353] ${
                    errors.name ? "border-red-500" : "border-[#555555]"
                  }`}
                  placeholder="Название задачи"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Сложность
                </label>
                <select
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      degree: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#444444] border border-[#555555] rounded text-white focus:outline-none focus:border-[#e85353]"
                >
                  {Object.values(TaskDegree)
                    .filter((value) => typeof value === "number")
                    .map((degree) => (
                      <option key={degree} value={degree}>
                        {getDifficultyName(degree as TaskDegree)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Описание *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: "" }));
                }}
                rows={3}
                className={`w-full px-3 py-2 bg-[#444444] border rounded text-white focus:outline-none focus:border-[#e85353] resize-none ${
                  errors.description ? "border-red-500" : "border-[#555555]"
                }`}
                placeholder="Описание задачи"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Ожидаемый вывод
              </label>
              <input
                type="text"
                value={formData.output}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, output: e.target.value }))
                }
                className="w-full px-3 py-2 bg-[#444444] border border-[#555555] rounded text-white focus:outline-none focus:border-[#e85353]"
                placeholder="Формат вывода"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Ключевые слова
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addKeyword())
                    }
                    className="flex-1 px-3 py-2 bg-[#444444] border border-[#555555] rounded text-white focus:outline-none focus:border-[#e85353]"
                    placeholder="Новое слово"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2 bg-[#444444] text-white rounded hover:bg-[#555555] border border-[#555555]"
                  >
                    +
                  </button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="bg-[#444444] text-gray-300 text-xs px-2 py-1 rounded flex items-center border border-[#555555]"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Подсказки
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addHint())
                    }
                    className="flex-1 px-3 py-2 bg-[#444444] border border-[#555555] rounded text-white focus:outline-none focus:border-[#e85353]"
                    placeholder="Новая подсказка"
                  />
                  <button
                    type="button"
                    onClick={addHint}
                    className="px-3 py-2 bg-[#444444] text-white rounded hover:bg-[#555555] border border-[#555555]"
                  >
                    +
                  </button>
                </div>
                {formData.hints.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="bg-[#444444] text-gray-300 text-xs px-2 py-1 rounded flex justify-between items-center border border-[#555555]"
                      >
                        <span className="truncate">{hint}</span>
                        <button
                          type="button"
                          onClick={() => removeHint(hint)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "input" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-white">
                Входные параметры
              </h4>
              <button
                type="button"
                onClick={addInput}
                className="px-3 py-2 bg-[#e85353] text-white rounded hover:bg-[#d64242] text-sm"
              >
                + Добавить
              </button>
            </div>

            {formData.input.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#555555] rounded">
                Нет параметров
              </div>
            ) : (
              <div className="space-y-3">
                {formData.input.map((input, index) => (
                  <div
                    key={index}
                    className="bg-[#444444] border border-[#555555] rounded p-3"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Название *
                        </label>
                        <input
                          type="text"
                          value={input.name}
                          onChange={(e) =>
                            updateInput(index, "name", e.target.value)
                          }
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] ${
                            errors[`input_${index}_name`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="название"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Тип *
                        </label>
                        <input
                          type="text"
                          value={input.type}
                          onChange={(e) =>
                            updateInput(index, "type", e.target.value)
                          }
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] ${
                            errors[`input_${index}_type`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="тип"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Ограничения
                        </label>
                        <input
                          type="text"
                          value={input.constraints}
                          onChange={(e) =>
                            updateInput(index, "constraints", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-[#555555] border border-[#666666] rounded text-white text-sm focus:outline-none focus:border-[#e85353]"
                          placeholder="ограничения"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Описание
                        </label>
                        <input
                          type="text"
                          value={input.description}
                          onChange={(e) =>
                            updateInput(index, "description", e.target.value)
                          }
                          className="w-full px-2 py-1 bg-[#555555] border border-[#666666] rounded text-white text-sm focus:outline-none focus:border-[#e85353]"
                          placeholder="описание"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInput(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "examples" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-white">Примеры</h4>
              <button
                type="button"
                onClick={addExample}
                className="px-3 py-2 bg-[#e85353] text-white rounded hover:bg-[#d64242] text-sm"
              >
                + Добавить
              </button>
            </div>

            {formData.examples.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#555555] rounded">
                Нет примеров
              </div>
            ) : (
              <div className="space-y-3">
                {formData.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-[#444444] border border-[#555555] rounded p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">
                        Пример {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Входные данные *
                        </label>
                        <textarea
                          value={example.input}
                          onChange={(e) =>
                            updateExample(index, "input", e.target.value)
                          }
                          rows={2}
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] resize-none ${
                            errors[`example_${index}_input`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="входные данные"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Выходные данные *
                        </label>
                        <textarea
                          value={example.output}
                          onChange={(e) =>
                            updateExample(index, "output", e.target.value)
                          }
                          rows={2}
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] resize-none ${
                            errors[`example_${index}_output`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="выходные данные"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-white">Тесты</h4>
              <button
                type="button"
                onClick={addTest}
                className="px-3 py-2 bg-[#e85353] text-white rounded hover:bg-[#d64242] text-sm"
              >
                + Добавить
              </button>
            </div>

            {formData.tests.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#555555] rounded">
                Нет тестов
              </div>
            ) : (
              <div className="space-y-3">
                {formData.tests.map((test, index) => (
                  <div
                    key={index}
                    className="bg-[#444444] border border-[#555555] rounded p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">
                          Тест {index + 1}
                        </span>
                        <label className="flex items-center space-x-1 text-xs text-gray-400">
                          <input
                            type="checkbox"
                            checked={test.isPublic}
                            onChange={(e) =>
                              updateTest(index, "isPublic", e.target.checked)
                            }
                            className="rounded bg-[#555555] border-[#666666] text-[#e85353] focus:ring-[#e85353]"
                          />
                          <span>Публичный</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Входные данные *
                        </label>
                        <textarea
                          value={test.input}
                          onChange={(e) =>
                            updateTest(index, "input", e.target.value)
                          }
                          rows={2}
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] resize-none ${
                            errors[`test_${index}_input`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="входные данные"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Ожидаемый вывод *
                        </label>
                        <textarea
                          value={test.output}
                          onChange={(e) =>
                            updateTest(index, "output", e.target.value)
                          }
                          rows={2}
                          className={`w-full px-2 py-1 bg-[#555555] border rounded text-white text-sm focus:outline-none focus:border-[#e85353] resize-none ${
                            errors[`test_${index}_output`]
                              ? "border-red-500"
                              : "border-[#666666]"
                          }`}
                          placeholder="ожидаемый вывод"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-[#444444]">
          <div className="text-sm text-gray-400">
            {Object.keys(errors).length > 0 && (
              <span className="text-red-400">
                Ошибок: {Object.keys(errors).length}
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#444444] border border-[#555555] text-gray-300 rounded hover:bg-[#555555] text-sm"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#e85353] text-white rounded hover:bg-[#d64242] disabled:bg-[#555555] disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Сохранение..." : task ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
