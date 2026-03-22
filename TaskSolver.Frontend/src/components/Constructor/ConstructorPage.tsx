import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonacoCodeEditor } from '../Tasks/Editor/MonacoCodeEditor';
import { constructorApi } from '../../api/constructor/constructor';
import {
  GeneratedTask,
  StepFeedback,
  ValidateStepResponse,
} from '../../api/constructor/types';

interface ExecutionResult {
  input: string;
  isPublic: boolean;
  stdout: string;
  stderr: string;
  isSovled: boolean;
}

const STEP_TYPE_NAMES = {
  0: 'Генерация данных',
  1: 'Валидация',
  2: 'Обработка',
  3: 'Оптимизация',
  4: 'Тестирование',
  5: 'Документация',
};

const formatText = (text: string) => {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      parts.push({
        type: 'bold',
        content: matched.slice(2, -2),
      });
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      parts.push({
        type: 'code',
        content: matched.slice(1, -1),
      });
    }

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  if (parts.length === 0) {
    return text;
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'bold') {
          return (
            <strong key={idx} className='font-bold text-white'>
              {part.content}
            </strong>
          );
        }
        if (part.type === 'code') {
          return (
            <code
              key={idx}
              className='bg-black/30 px-1.5 py-0.5 rounded text-green-400 font-mono text-xs'
            >
              {part.content}
            </code>
          );
        }
        return <span key={idx}>{part.content}</span>;
      })}
    </>
  );
};

export const ConstructorPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [feedback, setFeedback] = useState<ValidateStepResponse | null>(null);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'execution'>(
    'feedback',
  );
  const [stepFeedbacks, setStepFeedbacks] = useState<Map<number, StepFeedback>>(
    new Map(),
  );

  const navigate = useNavigate();

  const [generationParams, setGenerationParams] = useState({
    theme: '',
    difficulty: 'Средняя',
  });

  const difficulties = ['Легкая', 'Средняя', 'Сложная', 'Эксперт'];

  useEffect(() => {
    loadCurrentTask();
  }, []);

  const loadCurrentTask = async () => {
    try {
      const response = await constructorApi.getCurrentTask();
      if (response.data) {
        setTask(response.data);
        // Загружаем сохраненные обратные связи
        if (response.data.stepFeedbacks) {
          const feedbacksMap = new Map();
          Object.entries(response.data.stepFeedbacks).forEach(([step, fb]) => {
            feedbacksMap.set(parseInt(step), fb);
          });
          setStepFeedbacks(feedbacksMap);
        }

        // Определяем текущий шаг
        const nextStep = (response.data.lastCompletedStep || 0) + 1;
        setCurrentStep(
          nextStep <= response.data.steps.length
            ? nextStep
            : response.data.steps.length,
        );

        // Если есть сохраненная обратная связь для текущего шага, показываем её
        if (response.data.stepFeedbacks?.[nextStep]) {
          setFeedback({
            isValid: response.data.stepFeedbacks[nextStep].isValid,
            message: response.data.stepFeedbacks[nextStep].message,
            hint: response.data.stepFeedbacks[nextStep].hint,
            suggestions: response.data.stepFeedbacks[nextStep].suggestions,
            currentStep: nextStep,
            totalSteps: response.data.steps.length,
            isStepCompleted: false,
            isTaskCompleted: false,
            nextStepDescription: '',
            stepFeedback: response.data.stepFeedbacks[nextStep],
          });
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const handleGenerateTask = async () => {
    if (!generationParams.theme.trim()) {
      alert('Введите тему задачи');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await constructorApi.generateTask({
        theme: generationParams.theme,
        difficulty: generationParams.difficulty,
      });

      setTask(response.data);
      setCurrentStep(1);
      setFeedback(null);
      setExecutionResult(null);
      setActiveTab('feedback');
      setStepFeedbacks(new Map());
    } catch (error) {
      console.error('Error generating task:', error);
      alert('Ошибка при генерации задачи');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewTask = async () => {
    if (!task) return;

    setIsDeleting(true);
    try {
      await constructorApi.deleteCurrentTask();
      setTask(null);
      setCurrentStep(1);
      setFeedback(null);
      setExecutionResult(null);
      setCode('');
      setSelectedLanguage('python');
      setActiveTab('feedback');
      setStepFeedbacks(new Map());
      setGenerationParams({
        theme: '',
        difficulty: 'Средняя',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Ошибка при удалении задачи');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleValidateStep = async () => {
    if (!task) return;

    setIsValidating(true);
    try {
      const response = await constructorApi.validateStep({
        code,
        languageCode: selectedLanguage,
        stepNumber: currentStep,
      });

      setFeedback(response.data);
      setActiveTab('feedback');

      // Сохраняем обратную связь
      if (response.data.stepFeedback) {
        setStepFeedbacks((prev) =>
          new Map(prev).set(currentStep, response.data.stepFeedback!),
        );
      }

      // Если шаг завершен, обновляем задачу
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
            alert('🎉 Поздравляем! Вы успешно завершили задачу! 🎉');
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error validating step:', error);
      alert('Ошибка при проверке шага');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunCode = async (code: string, languageId: string) => {
    if (!task) return;

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await constructorApi.runCode({
        code,
        languageId,
      });

      setExecutionResult(response.data);
      setActiveTab('execution');
    } catch (error) {
      console.error('Error running code:', error);
      alert('Ошибка при выполнении кода');
    } finally {
      setIsRunning(false);
    }
  };

  const goToStep = (stepOrder: number) => {
    setCurrentStep(stepOrder);
    // Показываем сохраненную обратную связь для этого шага, если есть
    const savedFeedback = stepFeedbacks.get(stepOrder);
    if (savedFeedback && task) {
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

  const getStepStatusIcon = (step: any) => {
    if (step.isCompleted) return '✓';
    if (step.order === currentStep) return '●';
    return step.order;
  };

  const getStepStatusColor = (step: any) => {
    if (step.isCompleted) return 'bg-green-500 text-white';
    if (step.order === currentStep)
      return 'bg-[#e85353] text-white ring-2 ring-[#e85353]/50';
    return 'bg-[#333333] text-gray-400';
  };

  const canValidateStep = () => {
    if (!task) return false;
    const currentStepData = task.steps[currentStep - 1];
    // Можно проверять только текущий шаг, если он не выполнен
    return (
      !currentStepData?.isCompleted &&
      currentStep === (task.lastCompletedStep || 0) + 1
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-white'>
      {/* Header */}
      <div className='border-b border-[#333333] bg-[#2a2a2a]/95 backdrop-blur-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
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

              <div className='h-6 w-px bg-[#333333]'></div>

              <h1 className='text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-mono'>
                🛠️ Конструктор задач
              </h1>
            </div>

            {task && (
              <button
                onClick={handleNewTask}
                disabled={isDeleting}
                className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all font-mono text-sm shadow-lg'
              >
                {isDeleting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Удаление...</span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-6'>
        {!task ? (
          <div className='bg-[#2a2a2a]/95 backdrop-blur-sm rounded-2xl border border-[#333333] shadow-2xl p-8 max-w-2xl mx-auto animate-fadeIn'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-white font-mono mb-2'>
                Создать новую задачу
              </h2>
              <p className='text-gray-400 font-mono'>
                ИИ сгенерирует уникальную задачу специально для вас
              </p>
            </div>

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-400 font-mono mb-2'>
                  Тема задачи
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
                  placeholder='Например: Обработка списков, Работа с файлами, API...'
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
                      onClick={() =>
                        setGenerationParams((prev) => ({
                          ...prev,
                          difficulty: diff,
                        }))
                      }
                      className={`px-4 py-2 rounded-lg border font-mono transition-all ${
                        generationParams.difficulty === diff
                          ? getDifficultyBgColor(diff) +
                            ' ' +
                            getDifficultyColor(diff) +
                            ' shadow-lg scale-105'
                          : 'bg-[#333333] border-[#444444] text-gray-400 hover:border-[#e85353] hover:scale-105'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateTask}
                disabled={isGenerating}
                className='w-full bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all font-mono text-lg flex items-center justify-center space-x-2 shadow-xl'
              >
                {isGenerating ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Генерация задачи...</span>
                  </>
                ) : (
                  <>
                    <span>Сгенерировать задачу</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn'>
            {/* Левая колонка */}
            <div className='lg:col-span-1 space-y-6'>
              <div className='bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-xl p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h2 className='text-xl font-bold text-white font-mono mb-2'>
                      {task.title}
                    </h2>
                    <div className='flex items-center space-x-3'>
                      <span
                        className={`px-3 py-1 rounded-full border text-sm font-mono ${getDifficultyBgColor(task.difficulty)} ${getDifficultyColor(task.difficulty)}`}
                      >
                        {task.difficulty}
                      </span>
                      <span className='text-sm text-gray-400 font-mono'>
                        {task.theme}
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-[#e85353]'>
                      {task.lastCompletedStep || 0}/{task.steps.length}
                    </div>
                    <div className='text-xs text-gray-400 font-mono'>
                      шагов выполнено
                    </div>
                  </div>
                </div>

                <p className='text-gray-300 font-mono text-sm leading-relaxed'>
                  {task.description}
                </p>

                {/* Прогресс-бар */}
                <div className='mt-4'>
                  <div className='h-2 bg-[#333333] rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#e85353] to-[#ff6b6b] transition-all duration-500'
                      style={{
                        width: `${((task.lastCompletedStep || 0) / task.steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Список шагов */}
              <div className='bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-xl p-6'>
                <h3 className='text-lg font-bold text-white font-mono mb-4 flex items-center space-x-2'>
                  <span>📋 Шаги решения</span>
                </h3>

                <div className='space-y-3'>
                  {task.steps.map((step) => (
                    <div
                      key={step.order}
                      onClick={() => goToStep(step.order)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                        step.order === currentStep
                          ? 'border-[#e85353] bg-gradient-to-r from-[#e85353]/10 to-transparent shadow-lg'
                          : step.isCompleted
                            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
                            : 'border-[#333333] hover:border-[#e85353]/50 hover:bg-[#333333]/30'
                      }`}
                    >
                      <div className='flex items-start space-x-3'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${getStepStatusColor(step)}`}
                        >
                          {getStepStatusIcon(step)}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-1 flex-wrap gap-1'>
                            <span className='text-white font-mono font-medium'>
                              {step.title}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border bg-gradient-to-r inline-flex items-center space-x-1`}
                            >
                              <span>{STEP_TYPE_NAMES[step.type]}</span>
                            </span>
                          </div>
                          <p className='text-sm text-gray-400 font-mono line-clamp-2'>
                            {step.description}
                          </p>
                        </div>
                        {step.isCompleted && (
                          <div className='text-green-400'>
                            <svg
                              className='w-5 h-5'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-xl p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-bold text-white font-mono flex items-center space-x-2'>
                      <span>Шаг {currentStep}</span>
                      <span className='text-[#e85353]'>
                        / {task.steps.length}
                      </span>
                    </h3>
                    <p className='text-xl font-bold text-white mt-1'>
                      {task.steps[currentStep - 1]?.title}
                    </p>
                    <p className='text-gray-400 font-mono text-sm mt-2'>
                      {task.steps[currentStep - 1]?.description}
                    </p>
                    {task.steps[currentStep - 1]?.hint && (
                      <div className='mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                        <div className='text-xs text-blue-400 font-mono flex items-center space-x-1'>
                          <span>💡</span>
                          <span>Подсказка:</span>
                        </div>
                        <div className='text-sm text-gray-300 font-mono mt-1'>
                          {task.steps[currentStep - 1]?.hint}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='bg-[#1e1e1e] rounded-2xl border border-[#333333] shadow-xl overflow-hidden'>
                <MonacoCodeEditor
                  task={task}
                  height='400px'
                  theme='vs-dark'
                  onSubmit={handleRunCode}
                  onCodeChanged={setCode}
                  onLanguageChanged={setSelectedLanguage}
                  autoSave={true}
                />
              </div>

              <div className='flex space-x-4'>
                <button
                  onClick={handleValidateStep}
                  disabled={!canValidateStep() || isValidating || isRunning}
                  className='flex-1 bg-gradient-to-r from-[#e85353] to-[#d64242] hover:from-[#d64242] hover:to-[#c53535] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all font-mono flex items-center justify-center space-x-2 shadow-lg'
                >
                  {isValidating ? (
                    <>
                      <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Проверить шаг</span>
                    </>
                  )}
                </button>
              </div>

              {/* Результаты */}
              {(feedback || executionResult) && (
                <div className='bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-xl overflow-hidden'>
                  <div className='flex border-b border-[#333333]'>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`px-6 py-3 font-mono text-sm transition-all flex items-center space-x-2 ${
                        activeTab === 'feedback'
                          ? 'bg-gradient-to-r from-[#e85353]/10 to-transparent text-[#e85353] border-b-2 border-[#e85353]'
                          : 'text-gray-400 hover:text-white hover:bg-[#333333]/30'
                      }`}
                    >
                      <span>Обратная связь</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('execution')}
                      className={`px-6 py-3 font-mono text-sm transition-all flex items-center space-x-2 ${
                        activeTab === 'execution'
                          ? 'bg-gradient-to-r from-[#e85353]/10 to-transparent text-[#e85353] border-b-2 border-[#e85353]'
                          : 'text-gray-400 hover:text-white hover:bg-[#333333]/30'
                      }`}
                    >
                      <span>Результат выполнения</span>
                    </button>
                  </div>

                  <div className='p-6'>
                    {activeTab === 'feedback' && feedback && (
                      <div>
                        <div className='mb-4 flex items-center justify-between'>
                          <h4 className='text-md font-bold text-white font-mono'>
                            Результат проверки
                          </h4>
                          {feedback.isValid ? (
                            <span className='px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-mono flex items-center space-x-1'>
                              <span>✓</span>
                              <span>Решение верное</span>
                            </span>
                          ) : (
                            <span className='px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-mono flex items-center space-x-1'>
                              <span>✗</span>
                              <span>Требуются исправления</span>
                            </span>
                          )}
                        </div>

                        <div className='bg-[#333333]/50 rounded-xl p-4'>
                          <div className='text-gray-300 font-mono text-sm mb-3 whitespace-pre-wrap'>
                            {formatText(feedback.message)}
                          </div>

                          {feedback.suggestions.length > 0 && (
                            <div className='mt-3'>
                              <p className='text-sm font-mono text-gray-400 mb-2'>
                                💡 Предложения по улучшению:
                              </p>
                              <ul className='list-disc list-inside space-y-1'>
                                {feedback.suggestions.map(
                                  (suggestion, index) => (
                                    <li
                                      key={index}
                                      className='text-sm text-gray-300 font-mono'
                                    >
                                      {formatText(suggestion)}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {!feedback.isValid && feedback.hint && (
                            <div className='mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                              <div className='text-sm text-yellow-400 font-mono whitespace-pre-wrap'>
                                🔍 {formatText(feedback.hint)}
                              </div>
                            </div>
                          )}

                          {feedback.isStepCompleted && (
                            <div className='mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-pulse'>
                              <p className='text-sm text-green-400 font-mono font-medium mb-2'>
                                ✅ Отлично! Шаг {currentStep} выполнен!
                              </p>
                              {feedback.nextStepDescription && (
                                <div className='text-sm text-gray-300 font-mono'>
                                  📍 Следующий шаг:{' '}
                                  {formatText(feedback.nextStepDescription)}
                                </div>
                              )}
                            </div>
                          )}

                          {feedback.isTaskCompleted && (
                            <div className='mt-4 p-6 bg-purple-500/20 border border-purple-500/50 rounded-lg text-center animate-bounce'>
                              <p className='text-3xl mb-2'>🎉🏆🎉</p>
                              <p className='text-lg text-white font-mono font-bold'>
                                Поздравляем! Задача полностью решена!
                              </p>
                              <p className='text-sm text-gray-300 font-mono mt-2'>
                                Вы отлично справились! Продолжайте в том же
                                духе!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'execution' && executionResult && (
                      <div>
                        <h4 className='text-md font-bold text-white font-mono mb-3'>
                          Результат выполнения
                        </h4>

                        <div className='space-y-3'>
                          {executionResult.stdout && (
                            <div className='bg-[#333333]/50 rounded-xl p-4'>
                              <div className='text-gray-400 font-mono text-sm mb-2 flex items-center space-x-2'>
                                <span>📤</span>
                                <span>Вывод:</span>
                              </div>
                              <pre className='bg-black/30 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap'>
                                {executionResult.stdout}
                              </pre>
                            </div>
                          )}

                          {executionResult.stderr && (
                            <div className='bg-[#333333]/50 rounded-xl p-4'>
                              <div className='text-gray-400 font-mono text-sm mb-2 flex items-center space-x-2'>
                                <span>⚠️</span>
                                <span>Ошибка:</span>
                              </div>
                              <pre className='bg-black/30 p-4 rounded-lg text-sm text-red-400 font-mono overflow-x-auto whitespace-pre-wrap'>
                                {executionResult.stderr}
                              </pre>
                            </div>
                          )}

                          {!executionResult.stdout &&
                            !executionResult.stderr && (
                              <div className='bg-[#333333]/50 rounded-xl p-8 text-center'>
                                <p className='text-gray-400 font-mono'>
                                  ✨ Программа выполнилась без вывода
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isRunning && (
                <div className='bg-gradient-to-br from-[#2a2a2a] to-[#252525] rounded-2xl border border-[#333333] shadow-xl p-6'>
                  <div className='flex items-center justify-center space-x-3 py-8'>
                    <div className='w-6 h-6 border-2 border-[#e85353] border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-gray-400 font-mono'>
                      Выполнение кода...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructorPage;
