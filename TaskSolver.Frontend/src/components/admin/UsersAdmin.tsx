import { useState, useEffect } from "react";
import { usersApi } from "../../api/users/users";
import { authApi } from "../../api/auth/auth";
import {
  AdminProfileDto,
  UpdateProfileRequest,
  SocialLinkDto,
} from "../../api/users/types";
import { getStaticUrl } from "../../utils/url";

export const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<AdminProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getProfilesAdmin("", "", 1, 100);
      setUsers(response.data.items || []);
    } catch {
      setError("Ошибка загрузки пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      await usersApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.user.id !== id));
    } catch {
      setError("Ошибка удаления пользователя");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold text-white">Пользователи</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Управление пользователями системы
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

        {/* Форма создания - ТОЛЬКО email и пароль */}
        {isCreating && (
          <CreateUserForm
            onSave={() => {
              setIsCreating(false);
              loadUsers();
            }}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {/* Форма редактирования - все поля */}
        {editingId && (
          <EditUserForm
            user={users.find((u) => u.user.id === editingId)}
            onSave={() => {
              setEditingId(null);
              loadUsers();
            }}
            onCancel={() => setEditingId(null)}
          />
        )}

        <div className="bg-[#3a3a3a] rounded p-3 border border-[#444444] mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по email, имени, описанию или роли..."
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
              {filteredUsers.length} из {users.length}
            </div>
          </div>
        </div>

        <div className="bg-[#3a3a3a] rounded border border-[#444444] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#444444] border-b border-[#555555]">
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Пользователь
                  </th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Роль
                  </th>
                  <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                    Дата регистрации
                  </th>
                  <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#444444]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.user.id}
                      user={user}
                      onEdit={() => setEditingId(user.user.id)}
                      onDelete={() => handleDelete(user.user.id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm
                          ? "Пользователи не найдены"
                          : "Нет пользователей"}
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
  user: AdminProfileDto;
  onEdit: () => void;
  onDelete: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ user, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  return (
    <tr className="bg-[#3a3a3a] hover:bg-[#444444] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          {user.avatarUrl ? (
            <img
              src={getStaticUrl(user.avatarUrl)}
              alt={user.profileName || "User avatar"}
              className="w-8 h-8 rounded-full border border-[#555555]"
            />
          ) : (
            <div className="w-8 h-8 bg-[#e85353] rounded-full flex items-center justify-center border border-[#555555]">
              <span className="text-white text-xs font-medium">
                {(user.profileName || user.user.email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="text-white text-sm font-medium">
              {user.profileName || "Без имени"}
            </div>
            {user.bio && (
              <div className="text-gray-400 text-xs truncate max-w-xs">
                {user.bio}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-300 text-sm">{user.user.email}</div>
      </td>

      <td className="px-4 py-3">
        <div
          className={`text-sm px-2 py-1 rounded-full inline-block ${
            user.user.role === "Admin"
              ? "bg-blue-600/20 text-blue-300 border border-blue-500"
              : user.user.role === "Moderator"
              ? "bg-purple-600/20 text-purple-300 border border-purple-500"
              : "bg-green-600/20 text-green-300 border border-green-500"
          }`}
        >
          {user.user.role}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-300 text-sm">
          {formatDate(user.user.createdAt)}
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

// Компонент для создания пользователя (ТОЛЬКО email и пароль)
interface CreateUserFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        setError("Email и пароль обязательны");
        return;
      }

      if (formData.password.length < 6) {
        setError("Пароль должен быть не менее 6 символов");
        return;
      }

      await authApi.register({
        email: formData.email,
        password: formData.password,
      });

      onSave();
    } catch (err) {
      const fError = err as unknown as {
        response: { data: { errors: { password: string[] } } };
      };
      if (fError.response?.data.errors.password) {
        setError(fError.response?.data?.errors.password.join(";"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444] mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        Создание нового пользователя
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Пароль *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#e85353] hover:bg-[#d64242] disabled:bg-[#555555] text-white text-sm py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? "Создание..." : "Создать"}
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

// Компонент для редактирования пользователя (все поля)
interface EditUserFormProps {
  user: AdminProfileDto | undefined;
  onSave: () => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    profileName: user?.profileName || "",
    bio: user?.bio || "",
    description: user?.description || "",
    skills: user?.skills?.join(", ") || "",
    role: user?.user.role || "User",
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinkDto[]>(
    user?.socialLinks || []
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const normalizeFormData = (): UpdateProfileRequest => {
    return {
      profileName: formData.profileName.trim() || null,
      bio: formData.bio.trim() || null,
      description: formData.description.trim() || null,
      skills: formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [],
      socialLinks: socialLinks.length > 0 ? socialLinks : [],
    };
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocialLinkChange = (
    index: number,
    field: keyof SocialLinkDto,
    value: string
  ) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError("");

    try {
      const updateData = normalizeFormData();

      // Обновление профиля
      await usersApi.updateProfileAdmin(user.user.id, updateData);

      // Обновление аватара если есть
      if (avatar) {
        await usersApi.updateAvatarAdmin(user.user.id, avatar);
      }

      onSave();
    } catch {
      setError("Ошибка обновления пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;

    try {
      await usersApi.deleteUserAvatar(user.user.id);
      // Можно обновить данные или просто сообщить об успехе
      alert("Аватар удален");
      onSave(); // Перезагружаем данные
    } catch {
      setError("Ошибка удаления аватара");
    }
  };

  return (
    <div className="bg-[#3a3a3a] rounded p-4 border border-[#444444] mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        Редактирование пользователя: {user?.user.email}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Имя профиля
          </label>
          <input
            type="text"
            value={formData.profileName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profileName: e.target.value,
              }))
            }
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
            placeholder="Отображаемое имя"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Биография</label>
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            rows={2}
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm resize-none"
            placeholder="Краткая биография..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm resize-none"
            placeholder="Подробное описание..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Навыки (через запятую)
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, skills: e.target.value }))
            }
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
            placeholder="JavaScript, React, TypeScript..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-300">
              Социальные ссылки
            </label>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="bg-[#444444] hover:bg-[#555555] text-white text-xs py-1 px-2 rounded transition-colors"
            >
              + Добавить
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <div className="text-gray-400 text-sm py-2">
              Ссылки не добавлены
            </div>
          ) : (
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={link.platform || ""}
                    onChange={(e) =>
                      handleSocialLinkChange(index, "platform", e.target.value)
                    }
                    placeholder="Платформа"
                    className="flex-1 bg-[#444444] border border-[#555555] rounded px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
                  />
                  <input
                    type="url"
                    value={link.url || ""}
                    onChange={(e) =>
                      handleSocialLinkChange(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="flex-1 bg-[#444444] border border-[#555555] rounded px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Аватар</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="w-full bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#e85353] file:text-white hover:file:bg-[#d64242] transition-colors"
          />
          {user?.avatarUrl && (
            <div className="mt-2 flex items-center space-x-3">
              <span className="text-gray-400 text-xs">Текущий аватар:</span>
              <img
                src={getStaticUrl(user.avatarUrl)}
                alt="Current avatar"
                className="w-8 h-8 rounded-full border border-[#555555]"
              />
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Удалить
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#444444] rounded p-3 border border-[#555555]">
          <h4 className="text-white text-sm font-medium mb-2">
            Информация о пользователе
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">ID:</span>
              <span className="text-white ml-2">{user?.user.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{user?.user.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Дата регистрации:</span>
              <span className="text-white ml-2">
                {user
                  ? new Date(user.user.createdAt).toLocaleDateString("ru-RU")
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#e85353] hover:bg-[#d64242] disabled:bg-[#555555] text-white text-sm py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? "Сохранение..." : "Обновить"}
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

export default UsersAdmin;
