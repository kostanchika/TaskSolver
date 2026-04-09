// components/Constructor/SessionHistory.tsx
import { useState, useEffect } from 'react';
import { constructorApi } from '../../api/constructor/constructor';
import { ChatResponse } from '../../api/constructor/types';

interface SessionHistoryProps {
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  currentChatId,
  onSelectChat,
  onNewChat,
  isOpen,
  onToggle,
}) => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await constructorApi.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот чат?')) {
      await constructorApi.deleteChat(chatId);
      await loadChats();
      if (currentChatId === chatId) {
        onNewChat();
      }
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.theme.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Легкая: 'text-emerald-400',
      Средняя: 'text-yellow-400',
      Сложная: 'text-orange-400',
      Эксперт: 'text-red-400',
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getDifficultyBgColor = (difficulty: string) => {
    const colors = {
      Легкая: 'bg-emerald-500/20 border-emerald-500/50',
      Средняя: 'bg-yellow-500/20 border-yellow-500/50',
      Сложная: 'bg-orange-500/20 border-orange-500/50',
      Эксперт: 'bg-red-500/20 border-red-500/50',
    };
    return (
      colors[difficulty as keyof typeof colors] ||
      'bg-gray-500/20 border-gray-500/50'
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className='fixed left-4 top-24 z-20 bg-[#2a2a2a] border border-[#333333] rounded-lg p-3 hover:border-[#e85353] transition-all group shadow-xl'
        title='Показать историю'
      >
        <svg
          className='w-5 h-5 text-gray-400 group-hover:text-[#e85353]'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>
    );
  }

  return (
    <div className='fixed left-4 top-20 bottom-4 w-80 bg-gradient-to-b from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-2xl flex flex-col overflow-hidden z-20 animate-slideIn'>
      {/* Header */}
      <div className='p-4 border-b border-[#333333] bg-[#2d2d2d]'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-bold text-white font-mono flex items-center space-x-2'>
            <svg
              className='w-4 h-4 text-[#e85353]'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>История задач</span>
          </h3>
          <button
            onClick={onToggle}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
        </div>

        <button
          onClick={onNewChat}
          className='w-full bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] text-white rounded-lg py-2 font-mono text-sm flex items-center justify-center space-x-2 transition-all shadow-lg'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
          <span>Новая задача</span>
        </button>

        <div className='mt-3 relative'>
          <input
            type='text'
            placeholder='Поиск задач...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full bg-[#333333] border border-[#444444] rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#e85353] focus:ring-1 focus:ring-[#e85353] pl-9 transition-all'
          />
          <svg
            className='absolute left-3 top-2.5 w-4 h-4 text-gray-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {/* Chats List */}
      <div className='flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className='text-center py-8'>
            <svg
              className='w-12 h-12 text-gray-600 mx-auto mb-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <p className='text-gray-500 font-mono text-sm'>
              Нет сохраненных задач
            </p>
            <p className='text-gray-600 font-mono text-xs mt-1'>
              Создайте новую задачу
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                currentChatId === chat.id
                  ? 'border-[#e85353] bg-gradient-to-r from-[#e85353]/10 to-transparent shadow-lg'
                  : 'border-[#333333] hover:border-[#e85353]/50 hover:bg-[#333333]/30'
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        chat.lastCompletedStep === chat.totalSteps &&
                        chat.totalSteps > 0
                          ? 'bg-green-500'
                          : chat.lastCompletedStep > 0
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                      }`}
                    />
                    <h4 className='text-sm font-mono font-medium text-white truncate'>
                      {chat.title}
                    </h4>
                  </div>
                  <p className='text-xs text-gray-400 font-mono truncate mb-1'>
                    {chat.theme}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyBgColor(chat.difficulty)} ${getDifficultyColor(chat.difficulty)}`}
                    >
                      {chat.difficulty}
                    </span>
                    <span className='text-xs text-gray-500 font-mono'>
                      {chat.lastCompletedStep}/{chat.totalSteps} шагов
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 font-mono mt-1'>
                    {new Date(chat.updatedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all'
                >
                  <svg
                    className='w-4 h-4 text-red-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className='p-3 border-t border-[#333333] text-center'>
        <p className='text-xs text-gray-600 font-mono'>
          {chats.length} {chats.length === 1 ? 'задача' : 'задач'} в истории
        </p>
      </div>
    </div>
  );
};
