export interface ProgrammingTaskDto {
  id: string;
  name: string;
  description: string;
  degree: TaskDegree;
  keywords: string[];
  input: TaskInputDto[];
  output: string;
  hints: string[];
  examples: TaskExampleDto[];
  tests: TaskTestDto[];
  mark: number;
  isSolved: boolean;
}

export interface CreateProgrammingTaskRequest {
  name?: string;
  description?: string;
  degree?: TaskDegree;
  keywords?: string[];
  input?: TaskInputDto[];
  output?: string;
  hints?: string[];
  examples?: TaskExampleDto[];
  tests?: TaskTestDto[];
}

export interface UpdateProgrammingTaskRequest {
  name?: string;
  description?: string;
  degree?: TaskDegree;
  keywords?: string[];
  input?: TaskInputDto[];
  output?: string;
  hints?: string[];
  examples?: TaskExampleDto[];
  tests?: TaskTestDto[];
}

export interface TaskInputDto {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface TaskExampleDto {
  input: string;
  output: string;
}

export interface TaskTestDto {
  input: string;
  output: string;
  isPublic: boolean;
}

export enum TaskDegree {
  VeryEasy = 0,
  Easy = 1,
  Medium = 2,
  Hard = 3,
  VeryHard = 4,
  Expert = 5,
  Master = 6,
  Legendary = 7,
}
