import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../api/users/users";
import {
  ProfileDto,
  UpdateProfileRequest,
  SocialLinkDto,
} from "../../api/users/types";
import { getStaticUrl } from "../../utils/url";
import { SocialIcon } from "./SocialIcons";
import { SkillsSection } from "./SkillsSection";
import { useAuth } from "../../hooks/useAuth";

export const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    profileName: "",
    bio: "",
    description: "",
    skills: [] as string[],
    socialLinks: [] as SocialLinkDto[],
  });

  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "" });

  const popularPlatforms = [
    "GitHub",
    "LinkedIn",
    "Twitter",
    "Telegram",
    "Instagram",
    "Facebook",
    "YouTube",
    "Twitch",
    "Discord",
    "Portfolio",
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileResponse = await usersApi.getMyProfile();
      setProfile(profileResponse.data);
      setFormData({
        profileName: profileResponse.data.profileName || "",
        bio: profileResponse.data.bio || "",
        description: profileResponse.data.description || "",
        skills: profileResponse.data.skills || [],
        socialLinks: profileResponse.data.socialLinks || [],
      });
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const updateData: UpdateProfileRequest = {
        profileName: formData.profileName || null,
        bio: formData.bio || null,
        description: formData.description || null,
        skills: formData.skills.length > 0 ? formData.skills : [],
        socialLinks:
          formData.socialLinks.length > 0 ? formData.socialLinks : [],
      };

      await usersApi.updateProfile(updateData);
      setSaveMessage("✅ Профиль успешно обновлен!");
      setTimeout(() => setSaveMessage(""), 5000);
    } catch (error) {
      setSaveMessage("❌ Ошибка обновления профиля");
      console.error("Ошибка обновления:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const { clearTokens } = useAuth();

  const handleDeleteProfile = async () => {
    try {
      await usersApi.deleteProfile();
      clearTokens();
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error) {
      setSaveMessage("❌ Ошибка удаления профиля");
      console.error("Ошибка удаления:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleAvatarChange(event);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveMessage("❌ Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage("❌ Размер файла не должен превышать 5MB");
      return;
    }

    try {
      setSaveMessage("🔄 Загружаем ваш новый крутой аватар...");
      await usersApi.updateAvatar(file);
      setSaveMessage("✅ Аватар успешно обновлен! Выглядит потрясающе! 🤩");
      setTimeout(() => setSaveMessage(""), 4000);
      loadProfile();
    } catch (error) {
      setSaveMessage("❌ Ошибка загрузки аватара");
      console.error("Ошибка загрузки аватара:", error);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await usersApi.deleteAvatar();
      setSaveMessage("✅ Аватар удален! Возвращаемся к классике 🎩");
      setTimeout(() => setSaveMessage(""), 3000);
      loadProfile();
    } catch (error) {
      setSaveMessage("❌ Ошибка удаления аватара");
      console.error("Ошибка удаления аватара:", error);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handlePlatformSelect = (platform: string) => {
    setNewSocialLink((prev) => ({ ...prev, platform }));

    const urlTemplates: { [key: string]: string } = {
      GitHub: "https://github.com/",
      LinkedIn: "https://linkedin.com/in/",
      Twitter: "https://twitter.com/",
      Telegram: "https://t.me/",
      Instagram: "https://instagram.com/",
      Facebook: "https://facebook.com/",
      YouTube: "https://youtube.com/",
      Twitch: "https://twitch.tv/",
      Discord: "https://discord.gg/",
      Portfolio: "https://",
    };

    if (urlTemplates[platform]) {
      setNewSocialLink((prev) => ({ ...prev, url: urlTemplates[platform] }));
    }
  };

  const addSocialLink = () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      let finalUrl = newSocialLink.url;
      if (!finalUrl.startsWith("http")) {
        finalUrl = "https://" + finalUrl;
      }

      setFormData((prev) => ({
        ...prev,
        socialLinks: [
          ...prev.socialLinks,
          {
            platform: newSocialLink.platform,
            url: finalUrl,
          },
        ],
      }));
      setNewSocialLink({ platform: "", url: "" });
    }
  };

  const removeSocialLink = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const getCompletionPercentage = () => {
    const fields = [
      formData.profileName,
      formData.bio,
      formData.description,
      formData.skills.length > 0,
      formData.socialLinks.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#333333] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Загружаем ваш профиль...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#333333] py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all bg-[#2a2a2a] hover:bg-[#333333] py-2 px-4 rounded-lg border border-[#333333] group hover:border-[#444444]"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Назад к профилю</span>
          </button>
        </div>

        {saveMessage && (
          <div
            className={`mb-8 p-4 rounded-lg border-2 ${
              saveMessage.includes("❌")
                ? "bg-red-600/20 border-red-600 text-red-200"
                : "bg-green-600/20 border-green-600 text-green-200"
            }`}
          >
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#333333] shadow-2xl">
              <SectionHeader icon={<CameraIcon />} title="Аватар профиля" />

              <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-6">
                {profile?.avatarUrl ? (
                  <div className="relative group">
                    <img
                      src={getStaticUrl(profile.avatarUrl)}
                      alt="Аватар"
                      className="w-24 h-24 rounded-xl border-2 border-[#333333] group-hover:border-blue-400 transition-all shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs">Сменить</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-[#e85353] to-[#d64242] rounded-xl border-2 border-[#333333] flex items-center justify-center group hover:from-[#e85353] hover:to-[#d64242] transition-all shadow-lg">
                    <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                      {formData.profileName
                        ? formData.profileName.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  </div>
                )}

                <div className="flex-1 space-y-4 w-full">
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragOver
                        ? "border-blue-400 bg-blue-600/20"
                        : "border-[#333333] hover:border-[#444444] hover:bg-[#2d2d2d]"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">
                      Перетащите сюда изображение или{" "}
                      <span className="text-blue-400">выберите файл</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      PNG, JPG до 5MB
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53131] text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <UploadIcon className="w-4 h-4" />
                      <span>Загрузить</span>
                    </button>

                    {profile?.avatarUrl && (
                      <button
                        onClick={handleDeleteAvatar}
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Удалить</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#333333] shadow-2xl">
              <SectionHeader icon={<UserIcon />} title="Основная информация" />

              <div className="space-y-4">
                <FormField
                  label="Отображаемое имя"
                  required
                  value={formData.profileName}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, profileName: value }))
                  }
                  placeholder="Как к вам обращаться?"
                />

                <FormField
                  label="Био (краткое описание)"
                  value={formData.bio}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, bio: value }))
                  }
                  placeholder="Кратко опишите себя"
                  maxLength={100}
                  charCount={formData.bio.length}
                />

                <FormField
                  label="Подробное описание"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Расскажите о своем опыте, проектах и интересах..."
                  textarea
                  rows={4}
                />
              </div>
            </div>

            <SkillsSection
              skills={formData.skills}
              onAddSkill={(skill) => {
                if (!formData.skills.includes(skill)) {
                  setFormData((prev) => ({
                    ...prev,
                    skills: [...prev.skills, skill],
                  }));
                }
              }}
              onRemoveSkill={removeSkill}
            />

            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#333333] shadow-2xl">
              <SectionHeader icon={<LinkIcon />} title="Социальные сети" />

              <div className="space-y-4">
                <div className="space-y-3">
                  <FormField
                    label="Платформа"
                    value={newSocialLink.platform}
                    onChange={(value) =>
                      setNewSocialLink((prev) => ({ ...prev, platform: value }))
                    }
                    placeholder="Начните вводить название платформы..."
                    onKeyPress={(e) => handleKeyPress(e, addSocialLink)}
                    datalist={popularPlatforms}
                  />

                  <FormField
                    label="Ссылка"
                    required
                    type="url"
                    value={newSocialLink.url}
                    onChange={(value) =>
                      setNewSocialLink((prev) => ({ ...prev, url: value }))
                    }
                    placeholder="https://..."
                    onKeyPress={(e) => handleKeyPress(e, addSocialLink)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Быстрый выбор:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {popularPlatforms.slice(0, 5).map((platform) => (
                      <button
                        key={platform}
                        onClick={() => handlePlatformSelect(platform)}
                        className="bg-[#2d2d2d] hover:bg-[#333333] text-gray-300 text-sm px-3 py-1 rounded-lg transition-all border border-[#333333] flex items-center space-x-1 hover:border-purple-400 hover:text-white"
                      >
                        <SocialIcon platform={platform} className="w-3 h-3" />
                        <span>{platform}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addSocialLink}
                  disabled={!newSocialLink.platform || !newSocialLink.url}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-[#333333] disabled:to-[#333333] disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition-all w-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Добавить социальную ссылку</span>
                </button>

                {formData.socialLinks.length > 0 ? (
                  <div className="space-y-3">
                    {formData.socialLinks.map((link, index) => (
                      <SocialLinkItem
                        key={index}
                        link={link}
                        onRemove={() => removeSocialLink(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center py-4 border-2 border-dashed border-[#333333] rounded-lg">
                    Пока нет социальных ссылок
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#333333] shadow-2xl">
              <SectionHeader icon={<EyeIcon />} title="Заполненность" />

              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex justify-between items-center">
                  <span>Общая:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-[#2d2d2d] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium text-xs w-8">
                      {getCompletionPercentage()}%
                    </span>
                  </div>
                </div>
                {[
                  { label: "Имя", value: formData.profileName, required: true },
                  { label: "Био", value: formData.bio, required: true },
                  {
                    label: "Описание",
                    value: formData.description,
                    required: true,
                  },
                  {
                    label: "Навыки",
                    value: formData.skills.length > 0,
                    count: formData.skills.length,
                  },
                  {
                    label: "Соцсети",
                    value: formData.socialLinks.length > 0,
                    count: formData.socialLinks.length,
                  },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.label}:</span>
                    <StatusIndicator
                      value={item.value}
                      required={item.required}
                      count={item.count}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-[#333333] shadow-2xl">
              <SectionHeader icon={<LightningIcon />} title="Действия" />

              <div className="space-y-3">
                <ActionButton
                  onClick={handleSave}
                  disabled={isSaving || !formData.profileName}
                  loading={isSaving}
                  variant="primary"
                  icon={isSaving ? <Spinner /> : <CheckIcon />}
                >
                  {isSaving ? "Сохраняем..." : "Сохранить изменения"}
                </ActionButton>

                <ActionButton
                  onClick={() => navigate("/profile")}
                  variant="secondary"
                  icon={<EyeIcon />}
                >
                  Посмотреть профиль
                </ActionButton>

                <ActionButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  icon={<TrashIcon />}
                >
                  Удалить профиль
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onConfirm={handleDeleteProfile}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
    {icon}
    <span>{title}</span>
  </h2>
);

const FormField: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  maxLength?: number;
  charCount?: number;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  datalist?: string[];
}> = ({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea,
  rows,
  maxLength,
  charCount,
  onKeyPress,
  datalist,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label} {required && <span className="text-[#e85353]">*</span>}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        rows={rows}
        className="w-full px-4 py-3 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353] transition-all resize-none"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    ) : (
      <>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="w-full px-4 py-3 bg-[#2d2d2d] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e85353] focus:ring-2 focus:ring-[#e85353] transition-all"
          placeholder={placeholder}
          maxLength={maxLength}
          list={datalist ? "platforms" : undefined}
        />
        {datalist && (
          <datalist id="platforms">
            {datalist.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        )}
      </>
    )}
    {maxLength && charCount !== undefined && (
      <div className="text-right text-xs text-gray-500 mt-1">
        {charCount}/{maxLength}
      </div>
    )}
  </div>
);

const SocialLinkItem: React.FC<{
  link: SocialLinkDto;
  onRemove: () => void;
}> = ({ link, onRemove }) => (
  <div className="flex items-center justify-between bg-[#2d2d2d] p-4 rounded-lg border border-[#333333] group hover:border-purple-400 transition-all">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
        <SocialIcon platform={link.platform} className="w-4 h-4 text-white" />
      </div>
      <div className="text-white">
        <div className="font-semibold">{link.platform}</div>
        <a
          href={link.url ?? ""}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 text-sm hover:text-blue-400 transition-colors"
        >
          {link.url}
        </a>
      </div>
    </div>
    <button
      onClick={onRemove}
      className="text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
);

const StatusIndicator: React.FC<{
  value: string | boolean;
  required?: boolean;
  count?: number;
}> = ({ value, required, count }) => {
  const getStatus = () => {
    if (required) return value ? "✓" : "✗";
    if (typeof value === "boolean") return value ? "✓" : "○";
    return value ? `✓ (${count})` : "○";
  };

  const getColor = () => {
    if (required) return value ? "text-emerald-400" : "text-[#e85353]";
    return value ? "text-emerald-400" : "text-yellow-400";
  };

  return <span className={getColor()}>{getStatus()}</span>;
};

const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: "primary" | "secondary" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ onClick, disabled, loading, variant, icon, children }) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53131] text-white",
    secondary:
      "bg-[#2d2d2d] hover:bg-[#333333] text-white border border-[#333333] hover:border-[#444444]",
    danger:
      "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

const DeleteConfirmationModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-red-500 shadow-2xl max-w-md w-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrashIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Удалить профиль?
        </h3>
        <p className="text-gray-300 mb-6">
          Это действие нельзя отменить. Все ваши данные будут удалены
          безвозвратно.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-[#2d2d2d] hover:bg-[#333333] text-white py-2 px-4 rounded-lg transition-all border border-[#333333]"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
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
);

const CameraIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
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
);

const UserIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const LinkIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const LightningIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const Spinner: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <div
    className={`${className} border-2 border-white border-t-transparent rounded-full animate-spin`}
  />
);
