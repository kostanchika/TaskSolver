// /src/api/solutions/types.ts
export interface SolutionDto {
  id: string;
  languageId: string;
  userId: string;
  taskId: string;
  results: TestResult[];
  createdAt: string;
  completedAt: string | null;
  code: string;
}

export interface TestResult {
  input: string;
  isPublic: boolean;
  stdout: string;
  stderr: string;
  isSovled: boolean;
}

export interface CreateSolutionRequest {
  languageId: string;
  code: string;
}
