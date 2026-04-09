// api/constructor/types.ts
export interface Step {
  order: number;
  title: string;
  description: string;
  hint: string;
  type: number;
  isCompleted?: boolean;
}

export interface GeneratedTask {
  title: string;
  description: string;
  theme: string;
  difficulty: string;
  steps: Step[];
  lastCompletedStep: number;
  stepFeedbacks?: Record<number, StepFeedback>;
}

export interface StepFeedback {
  isValid: boolean;
  message: string;
  hint: string;
  suggestions: string[];
  validatedAt: string;
}

export interface ValidateStepRequest {
  code: string;
  languageCode: string;
  stepNumber: number;
  chatId: string;
}

export interface ValidateStepResponse {
  isValid: boolean;
  message: string;
  hint?: string;
  suggestions: string[];
  isStepCompleted: boolean;
  isTaskCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  nextStepDescription?: string;
  stepFeedback?: StepFeedback;
}

export interface RunCodeRequest {
  code: string;
  languageId: string;
  chatId: string;
  stepNumber?: number;
}

export interface TestResult {
  stdout: string;
  stderr: string;
  isSolved: boolean;
}

export interface ChatResponse {
  id: string;
  title: string;
  theme: string;
  difficulty: string;
  lastCompletedStep: number;
  totalSteps: number;
  updatedAt: string;
  isArchived: boolean;
}

export interface ChatDetailResponse {
  chat: ChatResponse;
  task: GeneratedTask;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  code?: string;
  language?: string;
  stepNumber?: number;
  isValid?: boolean;
  feedback?: string;
  createdAt: string;
}

export interface CreateChatRequest {
  theme: string;
  difficulty: string;
}
