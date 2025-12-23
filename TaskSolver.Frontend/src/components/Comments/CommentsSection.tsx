import React from "react";
import { useState, useEffect, useCallback, memo } from "react";
import { CommentDto } from "../../api/comments/types";
import { commentsApi } from "../../api/comments/comments";
import { ProfileDto } from "../../api/users/types";
import { usersApi } from "../../api/users/users";
import { useAuth } from "../../hooks/useAuth";

interface CommentsSectionProps {
  taskId: string;
  currentUserId?: string;
}

interface CommentWithUser extends CommentDto {
  user?: ProfileDto;
  replies: CommentWithUser[];
}

interface CommentComponentProps {
  comment: CommentWithUser;
  depth?: number;
  currentUserId?: string;
  onStartReply: (commentId: string) => void;
  onStartEdit: (comment: CommentDto) => void;
  onCancelActions: () => void;
  onSubmitReply: (commentId: string, text: string) => void;
  onSubmitEdit: (commentId: string, text: string) => void;
  onDeleteComment: (id: string) => void;
  replyingTo: string | null;
  editingId: string | null;
  replyText: string;
  editText: string;
  onReplyChange: (text: string) => void;
  onEditChange: (text: string) => void;
  isAdmin: boolean;
}

// Упрощенная функция форматирования
const formatCommentContent = (content: string) => {
  const elements: React.JSX.Element[] = [];
  const lines = content.split("\n");
  let key = 0;

  let currentText = "";
  let inBold = false;
  let inItalic = false;
  let inStrike = false;
  let inSpoiler = false;
  let inInlineCode = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = "";

  const flushCurrentText = () => {
    if (currentText) {
      if (inBold) {
        elements.push(
          <strong key={key++} className="font-semibold text-white">
            {currentText}
          </strong>
        );
      } else if (inItalic) {
        elements.push(
          <em key={key++} className="italic text-gray-200">
            {currentText}
          </em>
        );
      } else if (inStrike) {
        elements.push(
          <del key={key++} className="line-through text-gray-400">
            {currentText}
          </del>
        );
      } else if (inSpoiler) {
        elements.push(
          <span
            key={key++}
            className="bg-[#333333] text-transparent hover:text-white px-1 cursor-pointer transition-colors"
          >
            {currentText}
          </span>
        );
      } else if (inInlineCode) {
        elements.push(
          <code
            key={key++}
            className="bg-[#333333] px-1.5 py-0.5 text-gray-200 font-mono text-sm border border-[#3a3a3a]"
          >
            {currentText}
          </code>
        );
      } else {
        elements.push(
          <span key={key++} className="text-gray-200">
            {currentText}
          </span>
        );
      }
      currentText = "";
    }
  };

  const startCodeBlock = (language: string = "") => {
    inCodeBlock = true;
    codeBlockContent = [];
    codeBlockLanguage = language;
  };

  const endCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      const code = codeBlockContent.join("\n");
      elements.push(
        <div key={key++} className="bg-[#333333] border border-[#3a3a3a] my-3">
          {codeBlockLanguage && (
            <div className="px-3 py-2 bg-[#2a2a2a] border-b border-[#3a3a3a] text-xs text-gray-300 font-mono">
              {codeBlockLanguage}
            </div>
          )}
          <pre className="text-sm text-gray-200 overflow-x-auto p-3 font-mono leading-relaxed">
            {code}
          </pre>
        </div>
      );
    }
    inCodeBlock = false;
    codeBlockContent = [];
    codeBlockLanguage = "";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        endCodeBlock();
      } else {
        const language = line.trim().replace(/```/, "").trim();
        startCodeBlock(language);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    if (line.trim() === "") {
      flushCurrentText();
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === "|" && nextChar === "|" && !inInlineCode) {
        flushCurrentText();
        inSpoiler = !inSpoiler;
        j++;
        continue;
      }

      if (char === "*" && nextChar === "*" && !inInlineCode) {
        flushCurrentText();
        inBold = !inBold;
        j++;
        continue;
      }

      if (char === "*" && !inInlineCode) {
        flushCurrentText();
        inItalic = !inItalic;
        continue;
      }

      if (char === "~" && nextChar === "~" && !inInlineCode) {
        flushCurrentText();
        inStrike = !inStrike;
        j++;
        continue;
      }

      if (char === "`" && !inSpoiler) {
        flushCurrentText();
        inInlineCode = !inInlineCode;
        continue;
      }

      currentText += char;
    }

    flushCurrentText();

    if (i < lines.length - 1) {
      elements.push(<br key={key++} />);
    }
  }

  flushCurrentText();

  return <div className="leading-relaxed text-gray-200">{elements}</div>;
};

// Элегантные кнопки форматирования
const FormattingButtons = ({
  onInsert,
}: {
  onInsert: (text: string) => void;
}) => {
  const formats = [
    { label: "B", text: "**текст**", title: "Жирный" },
    { label: "I", text: "*текст*", title: "Курсив" },
    { label: "S", text: "~~текст~~", title: "Зачёркнутый" },
    { label: "</>", text: "`код`", title: "Код" },
    { label: "?", text: "||спойлер||", title: "Спойлер" },
    { label: "{}", text: "```\nкод\n```", title: "Блок кода" },
  ];

  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {formats.map((format) => (
        <button
          key={format.label}
          type="button"
          onClick={() => onInsert(format.text)}
          className="px-2 py-1.5 bg-[#333333] hover:bg-[#3a3a3a] text-xs text-gray-300 transition-colors duration-200 border border-[#3a3a3a] hover:border-[#e85353]"
          title={format.title}
        >
          {format.label}
        </button>
      ))}
    </div>
  );
};

// Компонент комментария
const CommentComponent = memo(
  ({
    comment,
    depth = 0,
    currentUserId,
    onStartReply,
    onStartEdit,
    onCancelActions,
    onSubmitReply,
    onSubmitEdit,
    onDeleteComment,
    replyingTo,
    editingId,
    replyText,
    editText,
    onReplyChange,
    onEditChange,
    isAdmin,
  }: CommentComponentProps) => {
    const isOwner = currentUserId === comment.userId || isAdmin;
    const isReplying = replyingTo === comment.id;
    const isEditing = editingId === comment.id;
    const marginLeft = Math.min(depth * 20, 120);

    const handleSubmitReply = useCallback(() => {
      onSubmitReply(comment.id, replyText);
    }, [comment.id, replyText, onSubmitReply]);

    const handleSubmitEdit = useCallback(() => {
      onSubmitEdit(comment.id, editText);
    }, [comment.id, editText, onSubmitEdit]);

    const handleInsertToReply = useCallback(
      (text: string) => {
        const textarea = document.querySelector(
          `[data-comment-id="${comment.id}"]`
        ) as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText =
            replyText.substring(0, start) + text + replyText.substring(end);
          onReplyChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + text.length,
              start + text.length
            );
          }, 0);
        }
      },
      [replyText, onReplyChange, comment.id]
    );

    const handleInsertToEdit = useCallback(
      (text: string) => {
        const textarea = document.querySelector(
          `[data-edit-id="${comment.id}"]`
        ) as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText =
            editText.substring(0, start) + text + editText.substring(end);
          onEditChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + text.length,
              start + text.length
            );
          }, 0);
        }
      },
      [editText, onEditChange, comment.id]
    );

    if (comment.isDeleted) {
      return (
        <div className="my-2" style={{ marginLeft }}>
          <div className="bg-[#252525] p-4 border border-[#333333] opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#333333] flex items-center justify-center">
                  <span className="text-xs text-gray-400">×</span>
                </div>
                <span className="text-sm text-gray-400">
                  Комментарий удален
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
          </div>

          {comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                  onStartReply={onStartReply}
                  onStartEdit={onStartEdit}
                  onCancelActions={onCancelActions}
                  onSubmitReply={onSubmitReply}
                  onSubmitEdit={onSubmitEdit}
                  onDeleteComment={onDeleteComment}
                  replyingTo={replyingTo}
                  editingId={editingId}
                  replyText={replyText}
                  editText={editText}
                  onReplyChange={onReplyChange}
                  onEditChange={onEditChange}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (!comment.userId) {
      return (
        <div className="my-2" style={{ marginLeft }}>
          <div className="bg-[#252525] p-4 border border-[#333333]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#333333] flex items-center justify-center">
                  <span className="text-xs">⚙</span>
                </div>
                <span className="text-sm font-medium text-white">Система</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
            <div className="text-gray-200 text-sm">
              {formatCommentContent(comment.content)}
            </div>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <div className="text-xs text-gray-400 mt-1">
                Обновлено: {new Date(comment.updatedAt).toLocaleString("ru-RU")}
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentComponent
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    currentUserId={currentUserId}
                    onStartReply={onStartReply}
                    onStartEdit={onStartEdit}
                    onCancelActions={onCancelActions}
                    onSubmitReply={onSubmitReply}
                    onSubmitEdit={onSubmitEdit}
                    onDeleteComment={onDeleteComment}
                    replyingTo={replyingTo}
                    editingId={editingId}
                    replyText={replyText}
                    editText={editText}
                    onReplyChange={onReplyChange}
                    onEditChange={onEditChange}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    const user = comment.user;

    return (
      <div className="my-2" style={{ marginLeft }}>
        <div className="bg-[#252525] p-4 border border-[#333333] hover:border-[#3a3a3a] transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {user?.avatarUrl ? (
                <img
                  src={`${import.meta.env.VITE_STATIC_URL}${user.avatarUrl}`}
                  alt={user.profileName || "User"}
                  className="w-6 h-6 object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-[#333333] flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.profileName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div>
                <a
                  href={`/profile/${comment.userId}`}
                  className="text-sm font-medium text-white hover:text-[#e85353] transition-colors"
                >
                  {user?.profileName || `User ${comment.userId.slice(-6)}`}
                </a>
                <div className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onStartReply(comment.id)}
                className="text-xs text-gray-400 hover:text-[#e85353] px-2 py-1 transition-colors"
              >
                Ответить
              </button>
              {isOwner && !comment.isDeleted && (
                <>
                  <button
                    onClick={() => onStartEdit(comment)}
                    className="text-xs text-gray-400 hover:text-blue-400 px-2 py-1 transition-colors"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 transition-colors"
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <FormattingButtons onInsert={handleInsertToEdit} />
              <textarea
                data-edit-id={comment.id}
                value={editText}
                onChange={(e) => onEditChange(e.target.value)}
                className="w-full bg-[#333333] border border-[#3a3a3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e85353] resize-none transition-colors"
                rows={4}
                placeholder="Редактируйте комментарий..."
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={onCancelActions}
                  className="px-3 py-1.5 bg-[#333333] text-gray-300 text-sm hover:bg-[#3a3a3a] transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmitEdit}
                  className="px-3 py-1.5 bg-[#e85353] text-white text-sm hover:bg-[#ff6b6b] transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-200 text-sm leading-relaxed">
              {formatCommentContent(comment.content)}
            </div>
          )}

          {/* Updated timestamp */}
          {comment.updatedAt &&
            comment.updatedAt !== comment.createdAt &&
            !isEditing && (
              <div className="text-xs text-gray-400 mt-2">
                Изменен: {new Date(comment.updatedAt).toLocaleString("ru-RU")}
              </div>
            )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 p-3 bg-[#333333] border border-[#3a3a3a]">
              <FormattingButtons onInsert={handleInsertToReply} />
              <textarea
                data-comment-id={comment.id}
                value={replyText}
                onChange={(e) => onReplyChange(e.target.value)}
                className="w-full bg-[#252525] border border-[#3a3a3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e85353] resize-none transition-colors"
                rows={3}
                placeholder="Введите ответ..."
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={onCancelActions}
                  className="px-3 py-1.5 bg-[#333333] text-gray-300 text-sm hover:bg-[#3a3a3a] transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="px-3 py-1.5 bg-[#e85353] text-white text-sm hover:bg-[#ff6b6b] disabled:bg-[#333333] disabled:cursor-not-allowed transition-colors"
                >
                  Ответить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                currentUserId={currentUserId}
                onStartReply={onStartReply}
                onStartEdit={onStartEdit}
                onCancelActions={onCancelActions}
                onSubmitReply={onSubmitReply}
                onSubmitEdit={onSubmitEdit}
                onDeleteComment={onDeleteComment}
                replyingTo={replyingTo}
                editingId={editingId}
                replyText={replyText}
                editText={editText}
                onReplyChange={onReplyChange}
                onEditChange={onEditChange}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

export const CommentsSection = ({
  taskId,
  currentUserId,
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [userCache, setUserCache] = useState<{ [userId: string]: ProfileDto }>(
    {}
  );
  const [mainComment, setMainComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const fetchComments = useCallback(async () => {
    const response = await commentsApi.getAllByTaskId(taskId);
    setComments(
      response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }, [taskId]);

  const loadUserProfiles = useCallback(
    async (userIds: string[]) => {
      const newUserCache = { ...userCache };
      let hasUpdates = false;

      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const response = await usersApi.getUserById(userId);
            newUserCache[userId] = response.data;
            hasUpdates = true;
          } catch (error) {
            console.error(`Error loading user ${userId}:`, error);
          }
        })
      );

      if (hasUpdates) {
        setUserCache(newUserCache);
      }
    },
    [userCache]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const userIds = Array.from(
      new Set(
        comments
          .filter((comment) => comment.userId && !userCache[comment.userId])
          .map((comment) => comment.userId)
      )
    ) as string[];

    if (userIds.length > 0) {
      loadUserProfiles(userIds);
    }
  }, [comments, userCache, loadUserProfiles]);

  const buildCommentTree = useCallback((): CommentWithUser[] => {
    const commentMap = new Map<string, CommentWithUser>();
    const rootComments: CommentWithUser[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        user: comment.userId ? userCache[comment.userId] : undefined,
        replies: [],
      });
    });

    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!;
        parent.replies.push(node);
        parent.replies.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        rootComments.push(node);
      }
    });

    return rootComments;
  }, [comments, userCache]);

  const handleAddComment = useCallback(
    async (content: string, parentId: string | null = null) => {
      if (!content.trim()) return;

      await commentsApi.create(taskId, parentId, content);
      await fetchComments();

      if (parentId) {
        setReplyingTo(null);
        setReplyText("");
      } else {
        setMainComment("");
      }
    },
    [taskId, fetchComments]
  );

  const handleUpdateComment = useCallback(
    async (id: string, content: string) => {
      if (!content.trim()) return;

      await commentsApi.update(id, content);
      await fetchComments();
      setEditingId(null);
      setEditText("");
    },
    [fetchComments]
  );

  const handleDeleteComment = useCallback(
    async (id: string) => {
      if (!window.confirm("Удалить комментарий?")) return;

      await commentsApi.delete(id);
      await fetchComments();
    },
    [fetchComments]
  );

  const handleSubmitMainComment = useCallback(() => {
    handleAddComment(mainComment, null);
  }, [mainComment, handleAddComment]);

  const handleSubmitReply = useCallback(
    (commentId: string, text: string) => {
      handleAddComment(text, commentId);
    },
    [handleAddComment]
  );

  const handleSubmitEdit = useCallback(
    (commentId: string, text: string) => {
      handleUpdateComment(commentId, text);
    },
    [handleUpdateComment]
  );

  const handleStartReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    setReplyText("");
    setEditingId(null);
  }, []);

  const handleStartEdit = useCallback((comment: CommentDto) => {
    setEditingId(comment.id);
    setEditText(comment.content);
    setReplyingTo(null);
  }, []);

  const handleCancelActions = useCallback(() => {
    setReplyingTo(null);
    setEditingId(null);
    setReplyText("");
    setEditText("");
  }, []);

  const handleReplyChange = useCallback((text: string) => {
    setReplyText(text);
  }, []);

  const handleEditChange = useCallback((text: string) => {
    setEditText(text);
  }, []);

  const handleInsertToMain = useCallback(
    (text: string) => {
      const textarea = document.querySelector(
        "[data-main-comment]"
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText =
          mainComment.substring(0, start) + text + mainComment.substring(end);
        setMainComment(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      }
    },
    [mainComment]
  );

  const { isAdmin } = useAuth();

  const commentTree = buildCommentTree();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Комментарии</h2>
        <div className="text-sm text-gray-400 bg-[#333333] px-3 py-1">
          {comments.filter((c) => !c.isDeleted).length} комментариев
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="bg-[#252525] p-4 border border-[#333333]">
        <h3 className="text-lg font-medium mb-3 text-white">
          Новый комментарий
        </h3>
        <FormattingButtons onInsert={handleInsertToMain} />
        <textarea
          data-main-comment
          value={mainComment}
          onChange={(e) => setMainComment(e.target.value)}
          className="w-full bg-[#333333] border border-[#3a3a3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e85353] resize-none transition-colors placeholder-gray-400"
          rows={4}
          placeholder="Поделитесь своими мыслями..."
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmitMainComment}
            disabled={!mainComment.trim()}
            className="px-4 py-2 bg-[#e85353] text-white text-sm font-medium hover:bg-[#ff6b6b] disabled:bg-[#333333] disabled:cursor-not-allowed transition-colors"
          >
            Опубликовать
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {commentTree.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#333333] flex items-center justify-center mx-auto mb-3 border border-[#3a3a3a]">
              <span className="text-xl">💬</span>
            </div>
            <p className="text-gray-400">Пока нет комментариев</p>
            <p className="text-gray-500 text-sm mt-1">
              Будьте первым, кто оставит комментарий
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {commentTree.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onStartReply={handleStartReply}
                onStartEdit={handleStartEdit}
                onCancelActions={handleCancelActions}
                onSubmitReply={handleSubmitReply}
                onSubmitEdit={handleSubmitEdit}
                onDeleteComment={handleDeleteComment}
                replyingTo={replyingTo}
                editingId={editingId}
                replyText={replyText}
                editText={editText}
                onReplyChange={handleReplyChange}
                onEditChange={handleEditChange}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
