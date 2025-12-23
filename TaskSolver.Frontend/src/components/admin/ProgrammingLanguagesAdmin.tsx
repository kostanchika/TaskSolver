import { useState, useEffect } from "react";
import { programmingLanguagesApi } from "../../api/programming-languages/programming-languages";
import { ProgrammingLanguageDto } from "../../api/programming-languages/types";
import { getStaticUrl } from "../../utils/url";

export const ProgrammingLanguagesAdmin: React.FC = () => {
  const [languages, setLanguages] = useState<ProgrammingLanguageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await programmingLanguagesApi.getAll();
      setLanguages(response.data);
    } catch {
      setError("Ошибка загрузки языков программирования");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Вы уверены, что хотите удалить этот язык программирования?")
    ) {
      return;
    }

    try {
      await programmingLanguagesApi.delete(id);
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));
    } catch {
      setError("Ошибка удаления языка программирования");
    }
  };

  const filteredLanguages = languages.filter(
    (language) =>
      language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.extra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Языки программирования
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Управление поддерживаемыми языками
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#e85353] hover:bg-[#d64242] text-white text-sm py-2 px-4 rounded transition-colors"
          >
            + Добавить
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {(isCreating || editingId) && (
          <LanguageForm
            language={
              editingId ? languages.find((l) => l.id === editingId) : undefined
            }
            onSave={() => {
              setIsCreating(false);
              setEditingId(null);
              loadLanguages();
            }}
            onCancel={() => {
              setIsCreating(false);
              setEditingId(null);
            }}
          />
        )}

        <div className="bg-[#3a3a3a] rounded p-3 border border-[#444444] mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="text-gray-400 text-sm">
              {filteredLanguages.length} из {languages.length}
            </div>
          </div>
        </div>

        <div className="bg-[#3a3a3a] rounded border border-[#444444] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#444444] border-b border-[#555555]">
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Язык
                  </th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Версия
                  </th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Дополнительно
                  </th>
                  <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#444444]">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <TableRow
                      key={language.id}
                      language={language}
                      onEdit={() => setEditingId(language.id)}
                      onDelete={() => handleDelete(language.id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm
                          ? "Ничего не найдено"
                          : "Нет языков программирования"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TableRowProps {
  language: ProgrammingLanguageDto;
  onEdit: () => void;
  onDelete: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ language, onEdit, onDelete }) => {
  return (
    <tr className="bg-[#3a3a3a] hover:bg-[#444444] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          {language.iconUrl ? (
            <img
              src={getStaticUrl(language.iconUrl)}
              alt={language.name || "Language icon"}
              className="w-6 h-6 rounded border border-[#555555]"
            />
          ) : (
            <div className="w-6 h-6 bg-[#e85353] rounded flex items-center justify-center border border-[#555555]">
              <span className="text-white text-xs">
                {language.name?.charAt(0) || "?"}
              </span>
            </div>
          )}
          <div className="text-white text-sm">
            {language.name || "Без названия"}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-300 text-sm">{language.version || "—"}</div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-400 text-sm max-w-xs truncate">
          {language.extra || "—"}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={onEdit}
            className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
            title="Редактировать"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
            title="Удалить"
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
        </div>
      </td>
    </tr>
  );
};

interface LanguageFormProps {
  language?: ProgrammingLanguageDto;
  onSave: () => void;
  onCancel: () => void;
}

const LanguageForm: React.FC<LanguageFormProps> = ({
  language,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: language?.name || "",
    version: language?.version || "",
    extra: language?.extra || "",
    icon: null as File | null,
    fileExtension: language?.fileExtensions || "",
    interpretor: language?.interpretor || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (
        !formData.name ||
        !formData.version ||
        (!language && !formData.icon)
      ) {
        setError("Заполните все обязательные поля");
        return;
      }

      if (language) {
        await programmingLanguagesApi.update(language.id, {
          Name: formData.name,
          Version: formData.version,
          Extra: formData.extra,
          Icon: formData.icon || null,
          FileExtension: formData.fileExtension,
          Interpretor: formData.interpretor,
        });
      } else {
        await programmingLanguagesApi.create({
          Name: formData.name,
          Version: formData.version,
          Extra: formData.extra,
          Icon: formData.icon!,
          FileExtension: formData.fileExtension,
          Interpretor: formData.interpretor,
        });
      }

      onSave();
    } catch {
      setError(language ? "Ошибка обновления" : "Ошибка создания");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444] mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        {language ? "Редактирование" : "Новый язык"}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              placeholder="Python, JavaScript..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Версия *</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, version: e.target.value }))
              }
              className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              placeholder="3.11, ES2022..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Расширение *
            </label>
            <input
              type="text"
              value={formData.fileExtension}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fileExtension: e.target.value,
                }))
              }
              className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              placeholder="py, js..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Интерпретатор *
            </label>
            <input
              type="text"
              value={formData.interpretor}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  interpretor: e.target.value,
                }))
              }
              className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              placeholder="python, node..."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Дополнительно
          </label>
          <input
            type="text"
            value={formData.extra}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, extra: e.target.value }))
            }
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
            placeholder="Дополнительная информация..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Иконка {!language && "*"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                icon: e.target.files?.[0] || null,
              }))
            }
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#e85353] file:text-white hover:file:bg-[#d64242] transition-colors"
          />
          {language?.iconUrl && (
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-gray-400 text-xs">Текущая:</span>
              <img
                src={getStaticUrl(language.iconUrl)}
                alt="Current icon"
                className="w-5 h-5 rounded border border-[#555555]"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#e85353] hover:bg-[#d64242] disabled:bg-[#555555] text-white text-sm py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? "Сохранение..." : language ? "Обновить" : "Создать"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-[#444444] hover:bg-[#555555] text-white text-sm py-2 px-4 rounded transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};
