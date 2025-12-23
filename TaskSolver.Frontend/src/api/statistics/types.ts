export interface StatisticsDto {
  userId: string;
  rating: number;
  totalSolutions: number;
  goodSolutions: number;
  percentile: number;
  history: TaskRatingHistory[];
}

export interface TaskRatingHistory {
  taskId: string;
  difference: number;
  createdAt: string;
}

export interface SolveStatisticsDto {
  totalSolutions: number;
  correctSolutions: number;
  avgSolvedTestsInIncorrectSolution: number;
  avgSolutionTimeSeconds: number;
  activeUsers: number;
  tasksStatistics: TaskStatisticsDto[];
}

export interface TaskStatisticsDto {
  taskId: string;
  totalSolutions: number;
  correctSolutions: number;
}

export interface DriveInfo {
  name: string;
  totalGb: number;
  freeGb: number;
  usedGb: number;
}

export interface ServerStatus {
  serverTime: string; // ISO‑строка времени
  uptime: string; // строка формата TimeSpan
  cpuUsagePercent: number; // загрузка CPU в процентах
  memoryWorkingSetMb: number; // память, занятая процессом (MB)
  totalMemoryMb: number; // общая доступная память (MB)
  drives: DriveInfo[]; // список дисков
  threads: number; // количество потоков
}
