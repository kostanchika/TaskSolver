// /src/components/matchmaking/MatchPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MatchDto,
  QueueInfoDto,
  SolveRecord,
} from '../../api/matchmaking/types';
import { matchmakingApi } from '../../api/matchmaking/matchmaking';
import { MonacoCodeEditor } from '../Tasks/Editor/MonacoCodeEditor';
import { programmingTasksApi } from '../../api/programming-tasks/programming-tasks';
import { ProgrammingTaskDto } from '../../api/programming-tasks/types';
import { useSignalR } from '../../hooks/useSignalR';
import { MatchTimer } from './MatchTimer';
import { QueueTimer } from './QueueTimer';
import { usersApi } from '../../api/users/users';
import { ProfileDto } from '../../api/users/types';

// Разделим на два разных компонента
const MatchContent = ({ matchId }: { matchId: string }) => {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'task' | 'solutions'>('task');
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchDto | null>(null);
  const [tasks, setTasks] = useState<ProgrammingTaskDto[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<SolveRecord | null>(
    null,
  );
  const [showSolutionDetails, setShowSolutionDetails] = useState(false);
  const [opponentProfile, setOpponentProfile] = useState<ProfileDto | null>(
    null,
  );

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('userId') || '';
  const isPlayer1 = match?.player1Id === currentUserId;
  const opponentId = isPlayer1 ? match?.player2Id : match?.player1Id;

  const currentTask = tasks[activeTaskIndex];
  const currentTaskSlot = match?.taskSlots.find(
    (ts) => ts.order === activeTaskIndex,
  );

  const userSolutions = useMemo(() => {
    if (!match || !currentTask) return [];

    return match.solveRecords
      .filter(
        (record) =>
          record.userId === currentUserId && record.taskId === currentTask.id,
      )
      .sort(
        (a, b) =>
          new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime(),
      );
  }, [match, currentTask, currentUserId]);

  const getSolvedCount = useCallback(
    (userId: string) => {
      if (!match) return 0;
      return match.solveRecords.filter(
        (record) => record.userId === userId && record.isCompleted,
      ).length;
    },
    [match],
  );

  const currentUserSolved = useMemo(
    () => getSolvedCount(currentUserId),
    [getSolvedCount, currentUserId],
  );
  const opponentSolved = useMemo(
    () => (opponentId ? getSolvedCount(opponentId) : 0),
    [getSolvedCount, opponentId],
  );
  const totalTasks = match?.taskSlots.length || 0;

  const hubUrl = `${import.meta.env.VITE_API_URL}/matchmakingHub`;

  const loadOpponentInfo = useCallback(async () => {
    if (!opponentId) return;

    try {
      const profileResponse = await usersApi.getUserById(opponentId);
      setOpponentProfile(profileResponse.data);
    } catch (error) {
      console.error('Error loading opponent info:', error);
    }
  }, [opponentId]);

  const loadMatch = useCallback(async () => {
    try {
      setIsLoading(true);
      const matchResponse = await matchmakingApi.getMatchById(matchId);
      const matchData = matchResponse.data;
      setMatch(matchData);

      if (matchData.taskSlots.length !== tasks.length) {
        const taskPromises = matchData.taskSlots
          .sort((a, b) => a.order - b.order)
          .map((slot) => programmingTasksApi.getById(slot.taskId));

        const tasksResponses = await Promise.all(taskPromises);
        setTasks(tasksResponses.map((r) => r.data));
      }
    } catch (error) {
      console.error('Error loading match:', error);
      navigate('/matchmaking');
    } finally {
      setIsLoading(false);
    }
  }, [matchId, tasks.length, navigate]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  useEffect(() => {
    if (opponentId) {
      loadOpponentInfo();
    }
  }, [opponentId, loadOpponentInfo]);

  useSignalR({
    url: hubUrl,
    onMatchUpdated: () => {
      loadMatch();
    },
  });

  const handleSubmit = async () => {
    if (!matchId || !language || !currentTaskSlot) return;

    try {
      await matchmakingApi.sendMatchTaskSolution(
        matchId,
        currentTaskSlot.taskId,
        language,
        code,
      );
      setActiveTab('solutions');
    } catch {
      alert('Ошибка при отправке решения');
    }
  };

  const onBack = () => navigate('/matchmaking');

  const getDifficultyColor = (degree: number) => {
    const colors = {
      0: 'text-emerald-400',
      1: 'text-green-400',
      2: 'text-yellow-400',
      3: 'text-orange-400',
      4: 'text-red-400',
      5: 'text-purple-400',
      6: 'text-indigo-400',
      7: 'text-pink-400',
    };
    return colors[degree as keyof typeof colors] || 'text-gray-400';
  };

  const getDifficultyText = (degree: number) => {
    const names = {
      0: 'Sigil0',
      1: 'Sigil1',
      2: 'Sigil2',
      3: 'Sigil3',
      4: 'Sigil4',
      5: 'Sigil5',
      6: 'Sigil6',
      7: 'Sigil7',
    };
    return names[degree as keyof typeof names] || 'Неизвестно';
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '??:??';
    }
  };

  const getSolutionStatus = (solution: SolveRecord) => {
    if (!solution.solvedAt) return 'running';
    if (solution.isCompleted) return 'success';
    return 'failed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-[#e85353]';
      case 'failed':
        return 'text-[#ff6b6b]';
      case 'running':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Решено';
      case 'failed':
        return 'Ошибка';
      case 'running':
        return 'Выполняется';
      default:
        return 'Неизвестно';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('ru-RU');

  const getTestStats = (solution: SolveRecord) => {
    const passedTests = solution.results.filter(
      (result) => result.isSovled,
    ).length;
    const publicTests = solution.results.filter((result) => result.isPublic);
    const privateTests = solution.results.filter((result) => !result.isPublic);

    return {
      total: solution.results.length,
      passed: passedTests,
      public: publicTests.length,
      private: privateTests.length,
      passedPublic: publicTests.filter((result) => result.isSovled).length,
      passedPrivate: privateTests.filter((result) => result.isSovled).length,
    };
  };

  // Определяем победителя
  const winnerInfo = useMemo(() => {
    if (!match?.winnerId) return null;

    if (match.winnerId === currentUserId) {
      return {
        name: 'Вы победили!',
        avatar: null,
        isCurrentUser: true,
      };
    } else if (match.winnerId === opponentId) {
      return {
        name: `${opponentProfile?.profileName || 'Оппонент'} победил!`,
        avatar: opponentProfile?.avatarUrl || null,
        isCurrentUser: false,
      };
    }
    return null;
  }, [match?.winnerId, currentUserId, opponentId, opponentProfile]);

  // Показываем экран победителя, если матч завершен и есть победитель
  if (match?.endedAt && winnerInfo) {
    return (
      <div className='min-h-screen bg-[#333333] flex items-center justify-center'>
        <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-2xl p-8 max-w-md w-full mx-4'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#333333] border-4 border-[#e85353] mb-6'>
              {winnerInfo.avatar ? (
                <img
                  src={import.meta.env.VITE_STATIC_URL + winnerInfo.avatar}
                  alt='Аватар'
                  className='w-16 h-16 rounded-full'
                />
              ) : (
                <svg
                  className='w-10 h-10 text-[#e85353]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              )}
            </div>

            <h2 className='text-2xl font-bold text-white font-mono mb-2'>
              {winnerInfo.name}
            </h2>
            <p className='text-gray-400 font-mono mb-6'>Матч завершен!</p>

            <div className='mb-6'>
              <div className='bg-[#333333] rounded-lg p-4 mb-4'>
                <div className='text-2xl font-bold text-white font-mono mb-1'>
                  Итоговый счет
                </div>
                <div className='flex justify-center items-center space-x-8'>
                  <div className='text-center'>
                    <div className='text-sm text-gray-400'>Вы</div>
                    <div className='text-3xl font-bold text-white'>
                      {currentUserSolved}/{totalTasks}
                    </div>
                  </div>
                  <div className='text-gray-400 text-2xl'>vs</div>
                  <div className='text-center'>
                    <div className='text-sm text-gray-400'>Соперник</div>
                    <div className='text-3xl font-bold text-white'>
                      {opponentSolved}/{totalTasks}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/matchmaking')}
              className='w-full py-3 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] transition-colors font-mono text-lg'
            >
              Вернуться к поиску соперника
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#333333] flex items-center justify-center'>
        <div className='flex items-center space-x-3'>
          <div className='w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
          <span className='text-white font-mono'>Загрузка матча...</span>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className='min-h-screen bg-[#333333] flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-white font-mono mb-4'>Матч не найден</div>
          <button
            onClick={() => navigate('/matchmaking')}
            className='px-6 py-3 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] transition-colors font-mono'
          >
            Вернуться к поиску
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#333333] text-white'>
      {showSolutionDetails && selectedSolution && (
        <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
          <div className='bg-[#2a2a2a] rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border border-[#333333]'>
            <div className='flex items-center justify-between p-6 border-b border-[#333333]'>
              <h3 className='text-lg font-semibold text-white'>
                Детали решения от {formatDate(selectedSolution.solvedAt)}
              </h3>
              <button
                onClick={() => setShowSolutionDetails(false)}
                className='text-gray-400 hover:text-[#e85353] transition-colors p-1 rounded-full hover:bg-[#333333] w-8 h-8 flex items-center justify-center'
              >
                ✕
              </button>
            </div>
            <div className='flex-1 overflow-auto p-6'>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-400'>Статус:</span>
                    <span
                      className={`ml-2 ${getStatusColor(
                        getSolutionStatus(selectedSolution),
                      )}`}
                    >
                      {getStatusText(getSolutionStatus(selectedSolution))}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-400'>Отправлено:</span>
                    <span className='text-gray-300 ml-2'>
                      {formatDate(selectedSolution.solvedAt)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-300 mb-3'>
                    Результаты тестов:
                  </h4>
                  <div className='space-y-3'>
                    {selectedSolution.results.map((result, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          result.isSovled
                            ? 'border-[#e85353]/30 bg-[#e85353]/10'
                            : 'border-[#ff6b6b]/30 bg-[#ff6b6b]/10'
                        }`}
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                result.isSovled
                                  ? 'bg-[#e85353]'
                                  : 'bg-[#ff6b6b]'
                              }`}
                            ></div>
                            <span className='text-gray-300 font-medium'>
                              Тест {index + 1} {!result.isPublic && '(скрытый)'}
                            </span>
                          </div>
                          <span
                            className={`text-sm ${
                              result.isSovled
                                ? 'text-[#e85353]'
                                : 'text-[#ff6b6b]'
                            }`}
                          >
                            {result.isSovled ? 'Пройден' : 'Не пройден'}
                          </span>
                        </div>

                        {result.isPublic ? (
                          <div className='space-y-2 text-sm'>
                            <div>
                              <span className='text-gray-400'>Ввод:</span>
                              <pre className='text-gray-300 mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]'>
                                {result.input}
                              </pre>
                            </div>
                            <div>
                              <span className='text-gray-400'>Вывод:</span>
                              <pre className='text-gray-300 mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]'>
                                {result.stdout}
                              </pre>
                            </div>
                            {result.stderr && (
                              <div>
                                <span className='text-gray-400'>Ошибка:</span>
                                <pre className='text-[#ff6b6b] mt-1 bg-[#333333] p-2 rounded overflow-x-auto border border-[#3a3a3a]'>
                                  {result.stderr}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='text-gray-400 text-sm'>
                            {result.isSovled
                              ? 'Скрытый тест пройден'
                              : 'Скрытый тест не пройден'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-gray-300 mb-3'>
                    Код решения:
                  </h4>
                  <pre className='bg-[#333333] p-4 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap border border-[#3a3a3a]'>
                    {selectedSolution.code}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='border-b border-[#333333] bg-[#2a2a2a]'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onBack}
                className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-mono group'
              >
                <svg
                  className='w-5 h-5 group-hover:-translate-x-1 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                <span>К поиску</span>
              </button>
              <div className='h-6 w-px bg-[#333333]'></div>
              <div>
                <h1 className='text-2xl font-bold text-white font-mono'>
                  Дуэль кодов
                </h1>
                <div className='flex items-center space-x-4 text-sm text-gray-400 font-mono'>
                  <span>Матч #{match.id.substring(0, 8)}</span>
                  {match.endedAt ? (
                    <span className='text-[#e85353]'>Завершен</span>
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                      <span>Идет игра</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-6'>
                <div className='text-right'>
                  <div className='text-sm text-gray-400 font-mono'>Вы</div>
                  <div className='text-xl font-bold text-white font-mono'>
                    {currentUserSolved}/{totalTasks}
                  </div>
                </div>

                <div className='text-2xl text-gray-400 font-mono'>vs</div>

                <div className='text-left'>
                  <div className='text-sm text-gray-400 font-mono'>
                    {opponentProfile?.profileName || 'Оппонент'}
                  </div>
                  <div className='text-xl font-bold text-white font-mono'>
                    {opponentSolved}/{totalTasks}
                  </div>
                </div>
              </div>

              <div className='h-8 w-px bg-[#333333]'></div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg'>
              <div className='border-b border-[#333333]'>
                <nav className='flex overflow-x-auto'>
                  {match.taskSlots
                    .sort((a, b) => a.order - b.order)
                    .map((slot, index) => {
                      const isSolved = match.solveRecords.some(
                        (record) =>
                          record.userId === currentUserId &&
                          record.taskId === slot.taskId &&
                          record.isCompleted,
                      );

                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setActiveTaskIndex(index);
                            setActiveTab('task');
                          }}
                          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors font-mono whitespace-nowrap flex items-center space-x-2 ${
                            activeTaskIndex === index
                              ? 'border-[#e85353] text-[#e85353]'
                              : 'border-transparent text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <span>Задача {index + 1}</span>
                          {isSolved && (
                            <svg
                              className='w-4 h-4 text-green-400'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                </nav>
              </div>

              <div className='p-6'>
                {currentTask ? (
                  <div className='space-y-6'>
                    <div className='border-b border-[#333333]'>
                      <nav className='flex space-x-8'>
                        <button
                          onClick={() => setActiveTab('task')}
                          className={`pb-3 text-sm font-medium font-mono transition-colors ${
                            activeTab === 'task'
                              ? 'text-[#e85353] border-b-2 border-[#e85353]'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Условие задачи
                        </button>
                        <button
                          onClick={() => setActiveTab('solutions')}
                          className={`pb-3 text-sm font-medium font-mono transition-colors ${
                            activeTab === 'solutions'
                              ? 'text-[#e85353] border-b-2 border-[#e85353]'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Мои решения
                          {userSolutions.length > 0 && (
                            <span className='ml-2 px-2 py-1 text-xs bg-[#333333] rounded-full'>
                              {userSolutions.length}
                            </span>
                          )}
                        </button>
                      </nav>
                    </div>

                    {activeTab === 'task' ? (
                      <>
                        <div>
                          <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-semibold text-white font-mono'>
                              {currentTask.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-mono ${getDifficultyColor(
                                currentTask.degree,
                              )} bg-[#333333]`}
                            >
                              {getDifficultyText(currentTask.degree)}
                            </span>
                          </div>
                          <div className='prose prose-invert max-w-none'>
                            <p className='text-gray-300 leading-relaxed whitespace-pre-wrap font-mono'>
                              {currentTask.description}
                            </p>
                          </div>
                        </div>

                        {currentTask.output && (
                          <div>
                            <h4 className='font-semibold text-white font-mono mb-3'>
                              Ожидаемый вывод
                            </h4>
                            <div className='bg-[#2d2d2d] rounded-lg p-4 border border-[#333333]'>
                              <p className='text-gray-300 font-mono'>
                                {currentTask.output}
                              </p>
                            </div>
                          </div>
                        )}

                        {currentTask.input && currentTask.input.length > 0 && (
                          <div>
                            <h4 className='font-semibold text-white font-mono mb-3'>
                              Входные данные
                            </h4>
                            <div className='bg-[#2d2d2d] rounded-lg p-4 border border-[#333333] overflow-x-auto'>
                              <table className='w-full font-mono text-sm'>
                                <thead>
                                  <tr className='border-b border-[#333333]'>
                                    <th className='text-left py-3 px-4 text-gray-400 font-medium'>
                                      Параметр
                                    </th>
                                    <th className='text-left py-3 px-4 text-gray-400 font-medium'>
                                      Тип
                                    </th>
                                    <th className='text-left py-3 px-4 text-gray-400 font-medium'>
                                      Ограничения
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {currentTask.input.map((input, index) => (
                                    <tr
                                      key={index}
                                      className='border-b border-[#333333] hover:bg-[#2f2f2f] transition-colors'
                                    >
                                      <td className='py-3 px-4 text-gray-300 font-medium'>
                                        {input.name}
                                      </td>
                                      <td className='py-3 px-4 text-gray-300'>
                                        {input.type}
                                      </td>
                                      <td className='py-3 px-4 text-gray-300'>
                                        {input.constraints || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {currentTask.examples &&
                          currentTask.examples.length > 0 && (
                            <div>
                              <h4 className='font-semibold text-white font-mono mb-4'>
                                Примеры
                              </h4>
                              <div className='space-y-4'>
                                {currentTask.examples.map((example, index) => (
                                  <div
                                    key={index}
                                    className='bg-[#2d2d2d] rounded-xl border border-[#333333] overflow-hidden'
                                  >
                                    <div className='bg-[#333333] px-4 py-3 text-sm font-medium font-mono'>
                                      Пример {index + 1}
                                    </div>
                                    <div className='p-4'>
                                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                          <div className='text-sm text-gray-400 mb-2 font-mono'>
                                            Входные данные:
                                          </div>
                                          <pre className='bg-[#252525] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono border border-[#333333]'>
                                            {example.input}
                                          </pre>
                                        </div>
                                        <div>
                                          <div className='text-sm text-gray-400 mb-2 font-mono'>
                                            Выходные данные:
                                          </div>
                                          <pre className='bg-[#252525] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono border border-[#333333]'>
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

                        <div className='pt-4 border-t border-[#333333]'>
                          <h4 className='font-semibold text-white font-mono mb-3'>
                            Информация о матче
                          </h4>
                          <div className='grid grid-cols-2 gap-4 text-sm font-mono'>
                            <div>
                              <span className='text-gray-400'>Начало:</span>
                              <span className='text-gray-300 ml-2'>
                                {formatTime(match.startedAt)}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-400'>Конец:</span>
                              <span className='text-gray-300 ml-2'>
                                {formatTime(match.endsAt)}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-400'>
                                Всего задач:
                              </span>
                              <span className='text-gray-300 ml-2'>
                                {totalTasks}
                              </span>
                            </div>
                            <div>
                              <span className='text-gray-400'>Статус:</span>
                              <span
                                className={`ml-2 ${
                                  match.endedAt
                                    ? 'text-[#e85353]'
                                    : 'text-green-400'
                                }`}
                              >
                                {match.endedAt ? 'Завершен' : 'В процессе'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className='py-4'>
                        <div className='flex items-center justify-between mb-6'>
                          <h3 className='text-lg font-semibold text-white font-mono'>
                            Мои решения для "{currentTask.name}"
                          </h3>
                          <button
                            onClick={() => setActiveTab('task')}
                            className='px-4 py-2 text-sm bg-[#e85353] text-white rounded hover:bg-[#d64242] transition-colors font-mono'
                          >
                            ← К задаче
                          </button>
                        </div>

                        {userSolutions.length === 0 ? (
                          <div className='text-center py-8'>
                            <div className='text-gray-400 mb-3'>
                              <svg
                                className='w-12 h-12 mx-auto mb-4 text-gray-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={1}
                                  d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25, 2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
                                />
                              </svg>
                              <p className='font-mono'>
                                Вы еще не отправляли решений для этой задачи
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab('task')}
                              className='px-6 py-2 bg-[#e85353] text-white rounded hover:bg-[#d64242] transition-colors font-mono'
                            >
                              Отправить первое решение
                            </button>
                          </div>
                        ) : (
                          <div className='space-y-3'>
                            {userSolutions.map((solution) => {
                              const status = getSolutionStatus(solution);
                              const stats = getTestStats(solution);

                              return (
                                <div
                                  key={solution.id}
                                  className='bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#333333] transition-colors cursor-pointer border border-[#333333] hover:border-[#3a3a3a]'
                                  onClick={() => {
                                    setSelectedSolution(solution);
                                    setShowSolutionDetails(true);
                                  }}
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-4'>
                                      <div
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                          status === 'success'
                                            ? 'bg-[#e85353]/20 text-[#e85353] border border-[#e85353]/30'
                                            : status === 'failed'
                                              ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30'
                                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        }`}
                                      >
                                        {getStatusText(status)}
                                      </div>
                                      <div className='flex items-center space-x-4 text-sm text-gray-400'>
                                        <span>
                                          Тесты: {stats.passed}/{stats.total}
                                        </span>
                                      </div>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                      <span className='text-gray-400 text-sm'>
                                        {formatDate(solution.solvedAt)}
                                      </span>
                                      <span className='text-gray-500 text-sm'>
                                        →
                                      </span>
                                    </div>
                                  </div>
                                  {solution.results.length !== 0 && (
                                    <div className='mt-3'>
                                      <div className='flex justify-between text-xs text-gray-400 mb-1'>
                                        <span>Прогресс тестов</span>
                                        <span>
                                          {Math.round(
                                            (stats.passed / stats.total) * 100,
                                          )}
                                          %
                                        </span>
                                      </div>
                                      <div className='w-full bg-[#333333] rounded-full h-2'>
                                        <div
                                          className='bg-[#e85353] h-2 rounded-full transition-all duration-300'
                                          style={{
                                            width: `${
                                              (stats.passed / stats.total) * 100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='text-gray-400 font-mono'>
                      Загрузка задачи...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg'>
              {match.endedAt && (
                <p className='text-[#e85353] text-sm mt-3 font-mono'>
                  Матч завершен. Отправка решений невозможна.
                </p>
              )}
            </div>

            <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg overflow-hidden'>
              <div className='space-y-4'>
                <MonacoCodeEditor
                  onCodeChanged={setCode}
                  onLanguageChanged={setLanguage}
                  onSubmit={handleSubmit}
                  height='500px'
                  theme={'vs-dark'}
                  onEditorReady={() => {}}
                  readOnly={!!match.endedAt}
                  task={null}
                />
              </div>
            </div>

            <div className='bg-[#2a2a2a] rounded-xl p-6 border border-[#333333] shadow-lg'>
              <h4 className='font-semibold mb-4 text-white font-mono'>
                Прогресс матча
              </h4>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm text-gray-400 font-mono mb-2'>
                    <span>Осталось времени</span>
                    {match.endedAt ? (
                      <span className='text-[#e85353]'>Матч завершен</span>
                    ) : (
                      <MatchTimer
                        endsAt={match.endsAt}
                        startedAt={match.startedAt}
                      />
                    )}
                  </div>
                  {!match.endedAt && (
                    <div className='h-2 bg-[#333333] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[#e85353] transition-all duration-1000'
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              calculateTimeProgress(
                                match.startedAt,
                                match.endsAt,
                              ),
                            ),
                          )}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className='flex justify-between text-sm text-gray-400 font-mono mb-2'>
                    <span>Решено задач</span>
                    <span>
                      {currentUserSolved} / {totalTasks}
                    </span>
                  </div>
                  <div className='h-2 bg-[#333333] rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-green-500 transition-all duration-500'
                      style={{
                        width: `${(currentUserSolved / totalTasks) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {opponentSolved > 0 && (
                  <div>
                    <div className='flex justify-between text-sm text-gray-400 font-mono mb-2'>
                      <span>Соперник решено</span>
                      <span>
                        {opponentSolved} / {totalTasks}
                      </span>
                    </div>
                    <div className='h-2 bg-[#333333] rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-500 transition-all duration-500'
                        style={{
                          width: `${(opponentSolved / totalTasks) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QueueContent = () => {
  const [queueInfo, setQueueInfo] = useState<QueueInfoDto | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const hubUrl = `${import.meta.env.VITE_API_URL}/matchmakingHub`;

  const loadQueueInfo = useCallback(async () => {
    try {
      const queueResponse = await matchmakingApi.getQueueInfo();
      const newQueueInfo = queueResponse.data;
      setQueueInfo(newQueueInfo);
      if (newQueueInfo.rating === 0) {
        setIsInQueue(true);
      } else {
        setIsInQueue(!!newQueueInfo.rating);
      }

      if (newQueueInfo.currentMatchId) {
        navigate(`/match/${newQueueInfo.currentMatchId}`, { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      const fError = error as unknown as { response: { status: number } };
      if (fError.response?.status === 404) {
        setIsInQueue(false);
        setQueueInfo(null);
      }
      return false;
    }
  }, [navigate]);

  useEffect(() => {
    loadQueueInfo().finally(() => setIsLoading(false));
  }, [loadQueueInfo]);

  useSignalR({
    url: hubUrl,
    onQueueUpdated: () => {
      loadQueueInfo();
    },
    onMatchStarted: (newMatchId: string) => {
      // Убрана анимация, сразу переходим к матчу
      navigate(`/match/${newMatchId}`);
    },
  });

  const handleJoinQueue = async () => {
    try {
      await matchmakingApi.joinQueue();
      await loadQueueInfo();
    } catch {
      alert('Не удалось присоединиться к очереди');
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await matchmakingApi.leaveQueue();
      await loadQueueInfo();
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  const onBack = () => navigate('/');

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#333333] flex items-center justify-center'>
        <div className='flex items-center space-x-3'>
          <div className='w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
          <span className='text-white font-mono'>Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#333333] text-white'>
      <div className='border-b border-[#333333] bg-[#2a2a2a]'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onBack}
                className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-mono group'
              >
                <svg
                  className='w-5 h-5 group-hover:-translate-x-1 transition-transform'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                <span>На главную</span>
              </button>
              <h1 className='text-2xl font-bold text-white font-mono'>
                Поиск соперника
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='bg-[#2a2a2a] rounded-xl border border-[#333333] shadow-lg p-8 mb-6'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#333333] border-2 border-[#e85353] mb-4'>
              <svg
                className='w-8 h-8 text-[#e85353]'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-white font-mono mb-2'>
              Поиск соперника
            </h2>
            <p className='text-gray-400 font-mono'>
              Найди достойного противника и соревнуйся в решении задач
            </p>
          </div>

          {queueInfo && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-[#2d2d2d] rounded-lg p-6 border border-[#333333] text-center'>
                <div className='text-3xl font-bold text-white font-mono mb-2'>
                  {queueInfo.playersCount}
                </div>
                <div className='text-gray-400 text-sm font-mono'>
                  Игроков в очереди
                </div>
              </div>
              <div className='bg-[#2d2d2d] rounded-lg p-6 border border-[#333333] text-center'>
                <div className='text-3xl font-bold text-white font-mono mb-2'>
                  {queueInfo.avgRating}
                </div>
                <div className='text-gray-400 text-sm font-mono'>
                  Средний рейтинг
                </div>
              </div>
              <div className='bg-[#2d2d2d] rounded-lg p-6 border border-[#333333] text-center'>
                <div className='text-3xl font-bold text-white font-mono mb-2'>
                  <QueueTimer waitingTime={queueInfo.waitingTime} />
                </div>
                <div className='text-gray-400 text-sm font-mono'>Ожидание</div>
              </div>
            </div>
          )}

          <div className='text-center'>
            {isInQueue ? (
              <div className='space-y-6'>
                <div className='flex flex-col items-center justify-center space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-8 h-8 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-white font-mono'>
                      Поиск соперника...
                    </span>
                  </div>
                  <div className='text-sm text-gray-400 font-mono max-w-md'>
                    Ищем соперника с похожим рейтингом.
                  </div>
                </div>
                <button
                  onClick={handleLeaveQueue}
                  className='px-8 py-3 bg-transparent text-[#e85353] border border-[#e85353] rounded-lg hover:bg-[#e85353]/10 transition-colors font-mono'
                >
                  Покинуть очередь
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoinQueue}
                className='px-8 py-4 bg-[#e85353] text-white rounded-lg hover:bg-[#d64242] transition-colors font-mono text-lg'
              >
                Найти соперника
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MatchPage = () => {
  const { matchId } = useParams();

  if (matchId) {
    return <MatchContent matchId={matchId} />;
  }

  return <QueueContent />;
};

const calculateTimeProgress = (startedAt: string, endsAt: string): number => {
  const startedAtDate = new Date(startedAt);
  const endsAtDate = new Date(endsAt);
  const now = new Date();

  const totalDuration = endsAtDate.getTime() - startedAtDate.getTime();
  const elapsed = now.getTime() - startedAtDate.getTime();

  if (totalDuration <= 0) return 100;
  if (elapsed <= 0) return 0;

  const progress = (elapsed / totalDuration) * 100;
  return Math.max(0, Math.min(100, progress));
};
