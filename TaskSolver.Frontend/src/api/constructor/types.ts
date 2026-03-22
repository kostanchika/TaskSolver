export type StepType = 0 | 1 | 2 | 3 | 4 | 5;

export interface TaskStep {
  order: number;
  title: string;
  description: string;
  hint: string;
  type: StepType;
  isCompleted: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description: string;
}

export interface GeneratedTask {
  id: string;
  title: string;
  theme: string;
  difficulty: string;
  description: string;
  steps: TaskStep[];
  lastCompletedStep: number;
  stepFeedbacks: Record<number, StepFeedback>;
  createdAt: string;
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
}

export interface ValidateStepResponse {
  isValid: boolean;
  message: string;
  hint: string;
  suggestions: string[];
  currentStep: number;
  totalSteps: number;
  isStepCompleted: boolean;
  isTaskCompleted: boolean;
  nextStepDescription: string;
  stepFeedback: StepFeedback;
}

export interface RunCodeRequest {
  code: string;
  languageId: string;
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

export interface GetHintRequest {
  stepNumber: number;
  currentCode: string;
  languageCode: string;
}
