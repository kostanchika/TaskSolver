import { useState, useEffect } from "react";
import { programmingTasksApi } from "../../api/programming-tasks/programming-tasks";
import { commentsApi } from "../../api/comments/comments";
import {
  CreateProgrammingTaskRequest,
  ProgrammingTaskDto,
  TaskDegree,
} from "../../api/programming-tasks/types";
import { CommentDto } from "../../api/comments/types";
import { TaskEditor } from "./TaskEditor";

type TabType = "tasks" | "comments";

export const ProgrammingTasksAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [tasks, setTasks] = useState<ProgrammingTaskDto[]>([]);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    TaskDegree | "all"
  >("all");
  const [editingTask, setEditingTask] = useState<ProgrammingTaskDto | null>(
    null
  );
  const [editingComment, setEditingComment] = useState<CommentDto | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [selectedTaskForComments, setSelectedTaskForComments] =
    useState<string>("all");

  useEffect(() => {
    loadTasks();
    if (activeTab === "comments") loadAllComments();
  }, [activeTab]);

  useEffect(() => {
    loadAllComments();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await programmingTasksApi.getAll(
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );
      setTasks(response.data.items);
    } catch {
      setError("Ошибка загрузки задач");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllComments = async () => {
    try {
      // Собираем комментарии со всех задач
      const allComments: CommentDto[] = [];
      for (const task of tasks) {
        if (task.id) {
          try {
            const response = await commentsApi.getAllByTaskId(task.id);
            if (response.data) {
              allComments.push(
                ...response.data.map((comment) => ({
                  ...comment,
                  taskName: task.name || `Задача #${task.id?.substring(0, 8)}`,
                }))
              );
            }
          } catch {
            // Пропускаем задачи без комментариев
          }
        }
      }
      setComments(allComments);
    } catch {
      setError("Ошибка загрузки комментариев");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) {
      return;
    }

    try {
      await programmingTasksApi.delete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch {
      setError("Ошибка удаления задачи");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
      return;
    }

    try {
      await commentsApi.delete(id);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch {
      setError("Ошибка удаления комментария");
    }
  };

  const handleEditTask = (task: ProgrammingTaskDto) => {
    setEditingTask(task);
    setIsCreating(true);
  };

  const handleEditComment = (comment: CommentDto) => {
    setEditingComment(comment);
    setEditCommentContent(comment.content);
  };

  const handleSaveTask = async (taskData: CreateProgrammingTaskRequest) => {
    try {
      if (editingTask?.id) {
        await programmingTasksApi.update(editingTask.id, taskData);
      } else {
        await programmingTasksApi.create(taskData);
      }

      setEditingTask(null);
      setIsCreating(false);
      loadTasks();
    } catch {
      setError(
        editingTask ? "Ошибка обновления задачи" : "Ошибка создания задачи"
      );
    }
  };

  const handleSaveComment = async () => {
    if (!editingComment) return;

    try {
      await commentsApi.update(editingComment.id, editCommentContent);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === editingComment.id
            ? {
                ...comment,
                content: editCommentContent,
                updatedAt: new Date().toISOString(),
              }
            : comment
        )
      );
      setEditingComment(null);
      setEditCommentContent("");
    } catch {
      setError("Ошибка обновления комментария");
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setIsCreating(false);
    setEditingComment(null);
    setEditCommentContent("");
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDifficulty =
      selectedDifficulty === "all" || task.degree === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTask =
      selectedTaskForComments === "all" ||
      comment.taskId === selectedTaskForComments;

    const isNotDeleted = !comment.isDeleted;

    return matchesSearch && matchesTask && isNotDeleted;
  });

  const getDifficultyName = (degree: TaskDegree): string => {
    const names = {
      [TaskDegree.VeryEasy]: "Sigil 0",
      [TaskDegree.Easy]: "Sigil 1",
      [TaskDegree.Medium]: "Sigil 2",
      [TaskDegree.Hard]: "Sigil 3",
      [TaskDegree.VeryHard]: "Sigil 4",
      [TaskDegree.Expert]: "Sigil 5",
      [TaskDegree.Master]: "Sigil 6",
      [TaskDegree.Legendary]: "Sigil 7",
    };
    return names[degree] || "Неизвестно";
  };

  const getDifficultyColor = (degree: TaskDegree): string => {
    const colors = {
      [TaskDegree.VeryEasy]: "bg-emerald-500",
      [TaskDegree.Easy]: "bg-green-500",
      [TaskDegree.Medium]: "bg-yellow-500",
      [TaskDegree.Hard]: "bg-orange-500",
      [TaskDegree.VeryHard]: "bg-red-500",
      [TaskDegree.Expert]: "bg-purple-500",
      [TaskDegree.Master]: "bg-indigo-500",
      [TaskDegree.Legendary]: "bg-pink-500",
    };
    return colors[degree] || "bg-gray-500";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskName = (taskId: string): string => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.name || `Задача #${taskId.substring(0, 8)}`;
  };

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
              Задачи программирования
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Управление задачами и комментариями
            </p>
          </div>
          {activeTab === "tasks" && (
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingTask(null);
              }}
              className="bg-[#e85353] hover:bg-[#d64242] text-white text-sm py-2 px-4 rounded transition-colors"
            >
              + Новая задача
            </button>
          )}
        </div>

        {/* Вкладки */}
        <div className="bg-[#3a3a3a] rounded border border-[#444444] mb-4">
          <div className="flex border-b border-[#444444]">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "tasks"
                  ? "text-white border-b-2 border-[#e85353]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Задачи ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "comments"
                  ? "text-white border-b-2 border-[#e85353]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Комментарии ({comments.length})
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Форма редактирования комментария */}
            {editingComment && (
              <div className="bg-[#444444] rounded p-4 border border-[#555555] mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Редактирование комментария
                </h3>

                <div className="mb-3">
                  <div className="text-sm text-gray-400 mb-1">
                    Автор: {editingComment.userId.substring(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    Задача: {getTaskName(editingComment.taskId)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Дата: {formatDate(editingComment.createdAt)}
                  </div>
                </div>

                <textarea
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[#555555] border border-[#666666] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#e85353] text-sm resize-none mb-3"
                  placeholder="Содержание комментария..."
                />

                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveComment}
                    className="bg-[#e85353] hover:bg-[#d64242] text-white text-sm py-2 px-4 rounded transition-colors"
                  >
                    Сохранить
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    className="bg-[#555555] hover:bg-[#666666] text-white text-sm py-2 px-4 rounded transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Форма создания/редактирования задачи */}
            {activeTab === "tasks" && isCreating && (
              <TaskEditor
                task={editingTask ?? undefined}
                onSave={handleSaveTask}
                onCancel={handleCancelEdit}
                isSubmitting={false}
              />
            )}

            {/* Поиск и фильтры */}
            <div className="mb-4">
              {activeTab === "tasks" ? (
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск задач..."
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

                  <select
                    value={selectedDifficulty}
                    onChange={(e) =>
                      setSelectedDifficulty(
                        e.target.value as TaskDegree | "all"
                      )
                    }
                    className="bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e85353] text-sm"
                  >
                    <option value="all">Все сложности</option>
                    {Object.values(TaskDegree)
                      .filter((value) => typeof value === "number")
                      .map((degree) => (
                        <option key={degree} value={degree}>
                          {getDifficultyName(degree as TaskDegree)}
                        </option>
                      ))}
                  </select>

                  <div className="text-gray-400 text-sm">
                    {filteredTasks.length} из {tasks.length}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск комментариев..."
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

                  <select
                    value={selectedTaskForComments}
                    onChange={(e) => setSelectedTaskForComments(e.target.value)}
                    className="bg-[#444444] border border-[#555555] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e85353] text-sm"
                  >
                    <option value="all">Все задачи</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id || ""}>
                        {task.name || `Задача #${task.id?.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>

                  <div className="text-gray-400 text-sm">
                    {filteredComments.length} из {comments.length}
                  </div>
                </div>
              )}
            </div>

            {/* Содержимое вкладки */}
            {activeTab === "tasks" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#444444] border-b border-[#555555]">
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Задача
                      </th>
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Сложность
                      </th>
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Ключевые слова
                      </th>
                      <th className="px-4 py-3 text-center text-gray-300 text-sm font-medium">
                        Тесты
                      </th>
                      <th className="px-4 py-3 text-center text-gray-300 text-sm font-medium">
                        Примеры
                      </th>
                      <th className="px-4 py-3 text-center text-gray-300 text-sm font-medium">
                        Комментарии
                      </th>
                      <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#444444]">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <TaskTableRow
                          key={task.name}
                          task={task}
                          getDifficultyName={getDifficultyName}
                          getDifficultyColor={getDifficultyColor}
                          onEdit={() => handleEditTask(task)}
                          onDelete={() => task.id && handleDeleteTask(task.id)}
                          onViewComments={() => {
                            setSelectedTaskForComments(task.id || "all");
                            setActiveTab("comments");
                          }}
                          commentsCount={
                            comments.filter((c) => c.taskId === task.id).length
                          }
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <div className="text-gray-500 text-sm">
                            {searchTerm || selectedDifficulty !== "all"
                              ? "Задачи не найдены"
                              : "Нет задач"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#444444] border-b border-[#555555]">
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Комментарий
                      </th>
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Автор
                      </th>
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Задача
                      </th>
                      <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                        Дата
                      </th>
                      <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#444444]">
                    {filteredComments.length > 0 ? (
                      filteredComments.map((comment) => (
                        <CommentTableRow
                          key={comment.id}
                          comment={comment}
                          getTaskName={getTaskName}
                          formatDate={formatDate}
                          onEdit={() => handleEditComment(comment)}
                          onDelete={() => handleDeleteComment(comment.id)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="text-gray-500 text-sm">
                            {searchTerm || selectedTaskForComments !== "all"
                              ? "Комментарии не найдены"
                              : "Нет комментариев"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskTableRowProps {
  task: ProgrammingTaskDto;
  getDifficultyName: (degree: TaskDegree) => string;
  getDifficultyColor: (degree: TaskDegree) => string;
  onEdit: () => void;
  onDelete: () => void;
  onViewComments: () => void;
  commentsCount: number;
}

const TaskTableRow: React.FC<TaskTableRowProps> = ({
  task,
  getDifficultyName,
  getDifficultyColor,
  onEdit,
  onDelete,
  onViewComments,
  commentsCount,
}) => {
  return (
    <tr className="bg-[#3a3a3a] hover:bg-[#444444] transition-colors">
      <td className="px-4 py-3">
        <div className="min-w-0">
          <div className="text-white font-medium text-sm mb-1">
            {task.name || "Без названия"}
          </div>
          <div className="text-gray-400 text-xs line-clamp-2 max-w-xs">
            {task.description || "Описание отсутствует"}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div
          className={`${getDifficultyColor(
            task.degree
          )} text-white text-xs px-3 py-1 rounded-full text-center border border-white/20 inline-block`}
        >
          {getDifficultyName(task.degree)}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {task.keywords && task.keywords.length > 0 ? (
            task.keywords.slice(0, 3).map((keyword, idx) => (
              <span
                key={idx}
                className="bg-[#444444] text-gray-300 text-xs px-2 py-1 rounded border border-[#555555]"
              >
                {keyword}
                {idx === 2 && task.keywords && task.keywords.length > 3 && (
                  <span className="text-gray-500">
                    {" "}
                    +{task.keywords.length - 3}
                  </span>
                )}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">—</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-center">
          <div className="text-white font-medium text-sm">
            {task.tests?.length || 0}
          </div>
          <div className="text-gray-400 text-xs">
            {task.tests?.filter((test) => test.isPublic).length || 0} публичных
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-center">
          <div className="text-white font-medium text-sm">
            {task.examples?.length || 0}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-center">
          <button
            onClick={onViewComments}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              commentsCount > 0
                ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500"
                : "bg-gray-600/20 text-gray-400 border border-gray-500 cursor-default"
            }`}
          >
            {commentsCount}
          </button>
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

interface CommentTableRowProps {
  comment: CommentDto;
  getTaskName: (taskId: string) => string;
  formatDate: (dateString: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

const CommentTableRow: React.FC<CommentTableRowProps> = ({
  comment,
  getTaskName,
  formatDate,
  onEdit,
  onDelete,
}) => {
  const isEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  return (
    <tr className="bg-[#3a3a3a] hover:bg-[#444444] transition-colors">
      <td className="px-4 py-3">
        <div className="min-w-0 max-w-xl">
          <div className="text-gray-300 text-sm line-clamp-3">
            {comment.content}
          </div>
          {comment.parentId && (
            <div className="text-gray-500 text-xs mt-1">
              Ответ на комментарий #{comment.parentId.substring(0, 8)}...
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#e85353] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {comment.userId.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-gray-300 text-sm truncate max-w-[100px]">
            {comment.userId.substring(0, 12)}...
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-300 text-sm truncate max-w-[150px]">
          {getTaskName(comment.taskId)}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-gray-400 text-sm">
          {formatDate(comment.createdAt)}
        </div>
        {isEdited && (
          <div className="text-gray-500 text-xs">
            ред. {formatDate(comment.updatedAt!)}
          </div>
        )}
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
