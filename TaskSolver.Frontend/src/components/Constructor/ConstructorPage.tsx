import { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MonacoCodeEditor } from '../Tasks/Editor/MonacoCodeEditor';
import { constructorApi } from '../../api/constructor/constructor';
import {
  GeneratedTask,
  StepFeedback,
  ValidateStepResponse,
  ChatMessage,
} from '../../api/constructor/types';
import { SessionHistory } from './SessionHistory';

interface ExecutionResult {
  stdout: string;
  stderr: string;
  isSolved: boolean;
}

const STEP_TYPE_NAMES: Record<number, string> = {
  0: 'Генерация данных',
  1: 'Валидация',
  2: 'Обработка',
  3: 'Оптимизация',
  4: 'Тестирование',
  5: 'Документация',
};

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const kind = message.messageKind ?? undefined;

  if (message.role === 'system' || kind === 'code_run') {
    const hasStructuredIo =
      message.programStdout != null ||
      message.programStderr != null ||
      message.programStdin != null;

    return (
      <div className='rounded-xl bg-[#121820] border border-cyan-900/40 p-3 text-xs font-mono space-y-3'>
        <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-cyan-400/95'>
          <span>Запуск кода</span>
          {message.language && (
            <span className='normal-case text-gray-400'>
              {message.language}
            </span>
          )}
          {message.stepNumber != null && (
            <span className='normal-case text-gray-500'>
              шаг {message.stepNumber}
            </span>
          )}
        </div>
        {message.code ? (
          <div>
            <div className='text-[10px] text-gray-500 mb-1'>Код</div>
            <pre className='max-h-40 overflow-auto rounded-lg bg-black/50 p-2 text-[11px] text-gray-200 border border-white/5'>
              {message.code}
            </pre>
          </div>
        ) : null}
        {hasStructuredIo ? (
          <>
            <div>
              <div className='text-[10px] text-gray-500 mb-1'>Ввод (stdin)</div>
              <pre className='max-h-24 overflow-auto rounded-lg bg-black/40 p-2 text-[11px] text-amber-100/90 border border-amber-900/30 whitespace-pre-wrap'>
                {message.programStdin?.length
                  ? message.programStdin
                  : '— пусто —'}
              </pre>
            </div>
            <div>
              <div className='text-[10px] text-gray-500 mb-1'>
                Вывод (stdout)
              </div>
              <pre className='max-h-36 overflow-auto rounded-lg bg-black/50 p-2 text-[11px] text-emerald-300/95 border border-emerald-900/25 whitespace-pre-wrap'>
                {message.programStdout || '—'}
              </pre>
            </div>
            <div>
              <div className='text-[10px] text-gray-500 mb-1'>
                Ошибки (stderr)
              </div>
              <pre className='max-h-28 overflow-auto rounded-lg bg-black/50 p-2 text-[11px] text-red-300/95 border border-red-900/30 whitespace-pre-wrap'>
                {message.programStderr || '—'}
              </pre>
            </div>
          </>
        ) : (
          <div>
            <div className='text-[10px] text-gray-500 mb-1'>
              Лог (старый формат)
            </div>
            <pre className='max-h-48 overflow-auto rounded-lg bg-black/45 p-2 text-[11px] text-gray-300 whitespace-pre-wrap'>
              {message.content}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (message.role === 'user') {
    const label =
      kind === 'user_step_code'
        ? `Шаг ${message.stepNumber ?? '?'} · проверка кода`
        : kind === 'user_request_task'
          ? 'Запрос задачи'
          : 'Ты';

    return (
      <div className='flex justify-end'>
        <div className='max-w-[min(100%,32rem)] rounded-2xl bg-[#e85353]/15 border border-[#e85353]/35 px-4 py-3 shadow-lg'>
          <div className='text-[10px] uppercase tracking-wide text-[#e85353]/90 mb-1.5'>
            {label}
          </div>
          <div className='text-sm text-gray-100 whitespace-pre-wrap leading-relaxed'>
            {message.content}
          </div>
          {message.code && (
            <pre className='mt-3 text-xs bg-black/45 p-3 rounded-lg overflow-x-auto max-h-48 border border-white/5'>
              {message.code}
            </pre>
          )}
        </div>
      </div>
    );
  }

  const isStepCheck = kind === 'step_validation';

  return (
    <div className='flex justify-start'>
      <div className='max-w-[min(100%,36rem)] rounded-2xl bg-[#252525] border border-[#3a3a3a] px-4 py-3 shadow-lg'>
        {isStepCheck && (
          <div className='flex flex-wrap items-center gap-2 mb-2'>
            <span className='text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-200 border border-amber-500/30'>
              Проверка шага {message.stepNumber}
            </span>
            {message.isValid === true && (
              <span className='text-[10px] text-emerald-400'>зачтено</span>
            )}
            {message.isValid === false && (
              <span className='text-[10px] text-orange-300'>
                можно улучшить
              </span>
            )}
          </div>
        )}
        {!isStepCheck && kind === 'task_generated' && (
          <div className='text-[10px] uppercase tracking-wide text-violet-300/90 mb-2'>
            Задача для практики
          </div>
        )}
        <div className='prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10'>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

const ConstructorPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [feedback, setFeedback] = useState<ValidateStepResponse | null>(null);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stepFeedbacks, setStepFeedbacks] = useState<Map<number, StepFeedback>>(
    new Map(),
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [runStdin, setRunStdin] = useState('');

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [generationParams, setGenerationParams] = useState({
    theme: '',
    difficulty: 'Средняя',
  });

  const difficulties = ['Легкая', 'Средняя', 'Сложная', 'Эксперт'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const applyTaskFromDetail = (
    loadedTask: GeneratedTask | null,
    msgs: ChatMessage[],
  ) => {
    setMessages(msgs);
    if (!loadedTask) {
      setTask(null);
      setStepFeedbacks(new Map());
      setFeedback(null);
      setCurrentStep(1);
      return;
    }

    setTask(loadedTask);
    if (loadedTask.stepFeedbacks) {
      const feedbacksMap = new Map<number, StepFeedback>();
      Object.entries(loadedTask.stepFeedbacks).forEach(([step, fb]) => {
        feedbacksMap.set(parseInt(step, 10), fb);
      });
      setStepFeedbacks(feedbacksMap);
    } else {
      setStepFeedbacks(new Map());
    }

    const nextStep = (loadedTask.lastCompletedStep || 0) + 1;
    setCurrentStep(
      nextStep <= loadedTask.steps.length ? nextStep : loadedTask.steps.length,
    );

    const lastUserCode = [...msgs]
      .reverse()
      .find((m) => m.role === 'user' && m.code);
    if (lastUserCode?.code) {
      setCode(lastUserCode.code);
    }

    const stepForFeedback =
      nextStep <= loadedTask.steps.length ? nextStep : loadedTask.steps.length;
    if (loadedTask.stepFeedbacks?.[stepForFeedback]) {
      const savedFeedback = loadedTask.stepFeedbacks[stepForFeedback];
      setFeedback({
        isValid: savedFeedback.isValid,
        message: savedFeedback.message,
        hint: savedFeedback.hint,
        suggestions: savedFeedback.suggestions,
        currentStep: stepForFeedback,
        totalSteps: loadedTask.steps.length,
        isStepCompleted: false,
        isTaskCompleted: false,
        nextStepDescription: '',
        stepFeedback: savedFeedback,
      });
    } else {
      setFeedback(null);
    }

    setExecutionResult(null);
  };

  const loadChat = async (chatId: string) => {
    try {
      const response = await constructorApi.getChat(chatId);
      const { chat, task: loadedTask, messages: msgs } = response.data;

      if (loadedTask) {
        loadedTask.lastCompletedStep = chat.lastCompletedStep;
      }

      setCurrentChatId(chat.id);
      setGenerationParams({
        theme: chat.theme,
        difficulty: chat.difficulty,
      });
      applyTaskFromDetail(loadedTask, msgs);
    } catch (error) {
      console.error('Error loading chat:', error);
      alert('Ошибка при загрузке чата');
    }
  };

  const refreshSession = async () => {
    if (!currentChatId) return;
    const response = await constructorApi.getChat(currentChatId);
    applyTaskFromDetail(response.data.task, response.data.messages);
  };

  const handleNewChat = () => {
    setTask(null);
    setCurrentChatId(undefined);
    setCurrentStep(1);
    setFeedback(null);
    setExecutionResult(null);
    setCode('');
    setStepFeedbacks(new Map());
    setMessages([]);
    setChatInput('');
    setGenerationParams({ theme: '', difficulty: 'Средняя' });
  };

  const handleGenerateTask = async () => {
    if (!generationParams.theme.trim()) {
      alert('Введите тему');
      return;
    }

    setIsGenerating(true);
    try {
      let chatId = currentChatId;

      if (!chatId) {
        const createResponse = await constructorApi.createChat({
          theme: generationParams.theme,
          difficulty: generationParams.difficulty,
        });
        chatId = createResponse.data;
        setCurrentChatId(chatId);
      }

      await constructorApi.generateTask({
        theme: generationParams.theme,
        difficulty: generationParams.difficulty,
        chatId,
      });

      const detail = await constructorApi.getChat(chatId);
      applyTaskFromDetail(detail.data.task, detail.data.messages);
    } catch (error) {
      console.error('Error generating task:', error);
      alert('Ошибка при генерации задачи');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentChatId || !chatInput.trim() || isSendingChat) return;

    setIsSendingChat(true);
    try {
      const response = await constructorApi.sendChatMessage(currentChatId, {
        content: chatInput.trim(),
      });
      setChatInput('');
      applyTaskFromDetail(response.data.task, response.data.messages);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Не удалось отправить сообщение');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleValidateStep = async () => {
    if (!task || !currentChatId) return;

    setIsValidating(true);

    try {
      const response = await constructorApi.validateStep({
        code,
        languageCode: selectedLanguage,
        stepNumber: currentStep,
        chatId: currentChatId,
      });

      setFeedback(response.data);

      if (response.data.stepFeedback) {
        setStepFeedbacks((prev) =>
          new Map(prev).set(currentStep, response.data.stepFeedback!),
        );
      }

      if (response.data.isStepCompleted) {
        const updatedTask = { ...task };
        const stepIndex = updatedTask.steps.findIndex(
          (s) => s.order === currentStep,
        );
        if (stepIndex !== -1) {
          updatedTask.steps[stepIndex].isCompleted = true;
          updatedTask.lastCompletedStep = currentStep;
          setTask(updatedTask);
        }

        if (response.data.isTaskCompleted) {
          setTimeout(() => {
            alert(
              'Задача пройдена по шагам. Можешь продолжить общаться в чате.',
            );
          }, 400);
        }
      }

      await refreshSession();
    } catch (error) {
      console.error('Error validating step:', error);
      alert('Ошибка при проверке шага');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunCode = async (runCode: string, languageId: string) => {
    if (!currentChatId) return;

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await constructorApi.runCode({
        code: runCode,
        languageId,
        chatId: currentChatId,
        stepNumber: task ? currentStep : undefined,
        stdin: runStdin.length > 0 ? runStdin : undefined,
      });

      setExecutionResult(response.data);
      await refreshSession();
    } catch (error) {
      console.error('Error running code:', error);
      alert('Ошибка при выполнении кода');
    } finally {
      setIsRunning(false);
    }
  };

  const goToStep = (stepOrder: number) => {
    if (!task) return;
    setCurrentStep(stepOrder);
    const savedFeedback = stepFeedbacks.get(stepOrder);
    if (savedFeedback) {
      setFeedback({
        isValid: savedFeedback.isValid,
        message: savedFeedback.message,
        hint: savedFeedback.hint,
        suggestions: savedFeedback.suggestions,
        currentStep: stepOrder,
        totalSteps: task.steps.length,
        isStepCompleted: stepOrder <= (task.lastCompletedStep || 0),
        isTaskCompleted:
          stepOrder === task.steps.length &&
          stepOrder <= (task.lastCompletedStep || 0),
        nextStepDescription: '',
        stepFeedback: savedFeedback,
      });
    } else {
      setFeedback(null);
    }
    setExecutionResult(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Легкая: 'text-emerald-400',
      Средняя: 'text-yellow-400',
      Сложная: 'text-orange-400',
      Эксперт: 'text-red-400',
    };
    return colors[difficulty] || 'text-gray-400';
  };

  const getDifficultyBgColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Легкая: 'bg-emerald-500/20 border-emerald-500/50',
      Средняя: 'bg-yellow-500/20 border-yellow-500/50',
      Сложная: 'bg-orange-500/20 border-orange-500/50',
      Эксперт: 'bg-red-500/20 border-red-500/50',
    };
    return colors[difficulty] || 'bg-gray-500/20 border-gray-500/50';
  };

  const getStepStatusIcon = (step: {
    order: number;
    isCompleted?: boolean;
  }) => {
    if (step.isCompleted) return '✓';
    if (step.order === currentStep) return '●';
    return String(step.order);
  };

  const getStepStatusColor = (step: {
    order: number;
    isCompleted?: boolean;
  }) => {
    if (step.isCompleted) return 'bg-green-500 text-white';
    if (step.order === currentStep)
      return 'bg-[#e85353] text-white ring-2 ring-[#e85353]/50';
    return 'bg-[#333333] text-gray-400';
  };

  const canValidateStep = () => {
    if (!task) return false;
    const currentStepData = task.steps[currentStep - 1];
    return (
      !currentStepData?.isCompleted &&
      currentStep === (task.lastCompletedStep || 0) + 1
    );
  };

  const renderGenerationForm = (compact = false) => (
    <div
      className={`bg-[#2a2a2a]/95 backdrop-blur-sm rounded-2xl border border-[#333333] shadow-2xl p-6 ${compact ? '' : 'max-w-2xl mx-auto'} animate-fadeIn`}
    >
      <div className={`${compact ? 'mb-4' : 'text-center mb-8'}`}>
        <h2 className='text-xl font-bold text-white font-mono mb-1'>
          Тема и сложность
        </h2>
        <p className='text-gray-400 font-mono text-sm'>
          ИИ предложит задачу и дорожную карту — в чате можно свободно разбирать
          тему, шаги проверяются только по кнопке «Проверить шаг».
        </p>
      </div>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-400 font-mono mb-2'>
            Тема
          </label>
          <input
            type='text'
            value={generationParams.theme}
            onChange={(e) =>
              setGenerationParams((prev) => ({
                ...prev,
                theme: e.target.value,
              }))
            }
            placeholder='Например: списки, файлы, REST API…'
            className='w-full bg-[#333333] border border-[#444444] rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-[#e85353] focus:ring-1 focus:ring-[#e85353] transition-all'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-400 font-mono mb-2'>
            Сложность
          </label>
          <div className='flex gap-2 flex-wrap'>
            {difficulties.map((diff) => (
              <button
                key={diff}
                type='button'
                onClick={() =>
                  setGenerationParams((prev) => ({ ...prev, difficulty: diff }))
                }
                className={`px-4 py-2 rounded-lg border font-mono transition-all ${
                  generationParams.difficulty === diff
                    ? `${getDifficultyBgColor(diff)} ${getDifficultyColor(diff)} shadow-lg scale-105`
                    : 'bg-[#333333] border-[#444444] text-gray-400 hover:border-[#e85353] hover:scale-105'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <button
          type='button'
          onClick={handleGenerateTask}
          disabled={isGenerating}
          className='w-full bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all font-mono flex items-center justify-center space-x-2 shadow-xl'
        >
          {isGenerating ? (
            <>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              <span>Генерация…</span>
            </>
          ) : (
            <span>Сгенерировать задачу</span>
          )}
        </button>
      </div>
    </div>
  );

  const renderChatColumn = (wrapperClass = '') => (
    <div
      className={`flex flex-col min-h-0 rounded-2xl border border-[#333] bg-[#1e1e1e]/90 overflow-hidden shadow-xl ${wrapperClass}`}
    >
      <div className='shrink-0 px-4 py-2.5 border-b border-[#333] bg-[#252525]'>
        <h3 className='text-sm font-mono text-gray-200'>Чат с наставником</h3>
        <p className='text-[11px] text-gray-500 mt-0.5 leading-snug'>
          Слева только переписка — она может расти, панель кода не уезжает.
        </p>
      </div>
      <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 && (
          <p className='text-gray-500 text-sm font-mono text-center py-8'>
            Сообщений пока нет. Поздоровайся или спроси про тему.
          </p>
        )}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <form
        onSubmit={handleSendChat}
        className='shrink-0 p-3 border-t border-[#333] bg-[#252525] flex gap-2'
      >
        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder='Напиши сообщение…'
          rows={2}
          disabled={!currentChatId || isSendingChat}
          className='flex-1 bg-[#333] border border-[#444] rounded-lg px-3 py-2 text-sm text-white font-mono resize-none focus:outline-none focus:border-[#e85353] disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={!currentChatId || !chatInput.trim() || isSendingChat}
          className='self-end px-4 py-2 rounded-lg bg-[#e85353] hover:bg-[#d64242] disabled:opacity-40 text-white font-mono text-sm'
        >
          {isSendingChat ? '…' : 'Отправить'}
        </button>
      </form>
    </div>
  );

  const showWorkspace = !!task;
  const showPreTaskWorkspace = !!currentChatId && !task;

  const memoizedTask = useMemo(() => {
    if (!currentChatId) return null;
    return { id: currentChatId };
  }, [currentChatId]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-white'>
      <div className='border-b border-[#333333] bg-[#2a2a2a]/95 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-[1600px] mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                type='button'
                onClick={() => navigate('/')}
                className='flex items-center space-x-2 text-gray-400 hover:text-white transition-all font-mono group'
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
              <div className='h-6 w-px bg-[#333333]' />
              <h1 className='text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-mono'>
                Конструктор
              </h1>
            </div>
          </div>
        </div>
      </div>

      <SessionHistory
        key={currentChatId}
        currentChatId={currentChatId}
        onSelectChat={loadChat}
        onNewChat={handleNewChat}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <div
        className={`transition-all duration-300 ${isHistoryOpen ? 'pl-96' : 'pl-0'}`}
      >
        <div className='max-w-[1600px] mx-auto px-6 py-6'>
          {!showWorkspace &&
            !showPreTaskWorkspace &&
            renderGenerationForm(false)}

          {showPreTaskWorkspace && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn min-h-[min(px,calc(100vh-10rem))]'>
              {renderChatColumn(
                'min-h-0 h-[min(520px,calc(100vh-11rem))] lg:h-auto',
              )}
              <div className='min-h-0 flex flex-col'>
                {renderGenerationForm(true)}
              </div>
            </div>
          )}

          {showWorkspace && task && (
            <div className='flex flex-col gap-4 animate-fadeIn min-h-0 h-[calc(200vh-7rem)]'>
              <div className='shrink-0 rounded-2xl border border-[#333] bg-gradient-to-br from-[#2a2a2a] to-[#252525] p-3 sm:p-4 shadow-xl'>
                <div className='flex flex-wrap items-start justify-between gap-3 mb-2'>
                  <div className='min-w-0'>
                    <h2 className='text-base sm:text-lg font-bold text-white font-mono truncate'>
                      {task.title}
                    </h2>
                    <div className='flex flex-wrap items-center gap-2 mt-1'>
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-xs font-mono ${getDifficultyBgColor(task.difficulty)} ${getDifficultyColor(task.difficulty)}`}
                      >
                        {task.difficulty}
                      </span>
                      <span className='text-xs text-gray-400 font-mono truncate max-w-[12rem] sm:max-w-md'>
                        {task.theme}
                      </span>
                    </div>
                  </div>
                  <div className='text-right shrink-0'>
                    <div className='text-lg font-bold text-[#e85353]'>
                      {task.lastCompletedStep || 0}/{task.steps.length}
                    </div>
                    <div className='text-[10px] text-gray-500 font-mono'>
                      шагов
                    </div>
                  </div>
                </div>
                <p className='text-gray-300 font-mono text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none max-w-4xl'>
                  {task.description}
                </p>
                <div className='mt-2 h-1 bg-[#333] rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-[#e85353] to-[#ff6b6b] transition-all duration-500'
                    style={{
                      width: `${((task.lastCompletedStep || 0) / task.steps.length) * 100}%`,
                    }}
                  />
                </div>
                <div className='mt-3 pt-3 border-t border-[#333]'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 font-mono mb-1.5'>
                    Шаги
                  </p>
                  <div className='flex gap-2 overflow-x-auto pb-1 -mx-1 px-1'>
                    {task.steps.map((step) => (
                      <button
                        key={step.order}
                        type='button'
                        onClick={() => goToStep(step.order)}
                        className={`flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left min-w-[120px] transition-all ${
                          step.order === currentStep
                            ? 'border-[#e85353] bg-[#e85353]/10'
                            : step.isCompleted
                              ? 'border-green-500/40 bg-green-500/5'
                              : 'border-[#444] hover:border-[#e85353]/40'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getStepStatusColor(step)}`}
                        >
                          {getStepStatusIcon(step)}
                        </div>
                        <div className='min-w-0'>
                          <div className='text-[11px] font-mono text-white truncate max-w-[100px]'>
                            {step.title}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex-1 min-h-[1500px] grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5'>
                {renderChatColumn('min-h-0 h-full max-h-full')}

                <div className='flex flex-col min-h-0 gap-3 h-full max-h-full overflow-hidden'>
                  <div className='shrink-0 rounded-xl border border-[#333] bg-[#252525] p-3 overflow-y-auto'>
                    <h3 className='text-xs font-mono text-[#e85353] mb-0.5'>
                      Шаг {currentStep} / {task.steps.length}
                    </h3>
                    <p className='text-sm text-white font-medium leading-snug'>
                      {task.steps[currentStep - 1]?.title}
                    </p>
                    <p className='text-gray-400 font-mono text-[11px] mt-1.5 leading-relaxed'>
                      {task.steps[currentStep - 1]?.description}
                    </p>
                    {task.steps[currentStep - 1]?.hint && (
                      <div className='mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-gray-300 font-mono'>
                        Подсказка: {task.steps[currentStep - 1]?.hint}
                      </div>
                    )}
                  </div>

                  <div className='shrink-0 min-h-[500px] h-[min(36vh,340px)] rounded-xl border border-[#333] bg-[#2a2a2a] overflow-hidden flex flex-col shadow-inner'>
                    <MonacoCodeEditor
                      task={memoizedTask}
                      theme='vs-dark'
                      onCodeChanged={setCode}
                      onLanguageChanged={setSelectedLanguage}
                      autoSave={true}
                    />
                  </div>

                  <div className='shrink-0 rounded-xl border border-[#e85353]/25 bg-[#1f1f1f] p-3 space-y-3 shadow-lg'>
                    <div>
                      <label className='block text-[11px] font-mono text-gray-400 mb-1'>
                        Ввод для программы (stdin)
                      </label>
                      <textarea
                        value={runStdin}
                        onChange={(e) => setRunStdin(e.target.value)}
                        rows={2}
                        placeholder='Что передать в stdin при запуске (можно пусто)'
                        className='w-full bg-[#2d2d2d] border border-[#444] rounded-lg px-3 py-2 text-xs text-white font-mono resize-none focus:outline-none focus:border-[#e85353]'
                      />
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        type='button'
                        onClick={() =>
                          void handleRunCode(code, selectedLanguage)
                        }
                        disabled={
                          !currentChatId ||
                          !code.trim() ||
                          isRunning ||
                          isValidating
                        }
                        className='flex-1 min-w-[8rem] py-2.5 px-4 rounded-lg bg-[#2d5a3d] hover:bg-[#356b4a] border border-green-700/50 disabled:opacity-40 text-white font-mono text-sm'
                      >
                        {isRunning ? 'Запуск…' : 'Запустить код'}
                      </button>
                      <button
                        type='button'
                        onClick={handleValidateStep}
                        disabled={
                          !canValidateStep() || isValidating || isRunning
                        }
                        className='flex-1 min-w-[8rem] py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] disabled:opacity-50 text-white font-mono text-sm font-bold'
                      >
                        {isValidating ? 'Проверка…' : 'Проверить шаг'}
                      </button>
                    </div>
                  </div>

                  {feedback && (
                    <div className='shrink-0  overflow-y-auto rounded-lg border border-[#444] bg-[#222] p-3 text-sm'>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='font-mono text-gray-500 text-[10px]'>
                          Последняя проверка шага
                        </span>
                        {feedback.isValid ? (
                          <span className='text-emerald-400 text-[10px]'>
                            ок
                          </span>
                        ) : (
                          <span className='text-orange-300 text-[10px]'>
                            доработать
                          </span>
                        )}
                      </div>
                      <p className='text-gray-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed'>
                        {feedback.message}
                      </p>
                    </div>
                  )}

                  {executionResult && (
                    <div className='shrink-0 max-h-[18vh] overflow-y-auto rounded-lg border border-[#444] bg-[#1a1a1a] p-2 text-[11px] font-mono space-y-1'>
                      <div className='text-gray-500 text-[10px]'>
                        Быстрый просмотр последнего запуска
                      </div>
                      {executionResult.stdout ? (
                        <pre className='text-emerald-400 whitespace-pre-wrap'>
                          {executionResult.stdout}
                        </pre>
                      ) : null}
                      {executionResult.stderr ? (
                        <pre className='text-red-400 whitespace-pre-wrap'>
                          {executionResult.stderr}
                        </pre>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstructorPage;
