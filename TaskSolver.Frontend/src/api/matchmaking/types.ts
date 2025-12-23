export interface MatchDto {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string | null;
  taskSlots: TaskSlot[];
  solveRecords: SolveRecord[];
  startedAt: string;
  endsAt: string;
  endedAt?: string | null;
}

export interface TaskSlot {
  id: string;
  taskId: string;
  order: number;
}

export interface SolveRecord {
  id: string;
  userId: string;
  taskId: string;
  solvedAt: string;
  isCompleted: boolean;
  code: string;
  results: TestResult[];
}

export interface TestResult {
  input: string;
  isPublic: boolean;
  stdout: string;
  stderr: string;
  isSovled: boolean;
}

export interface QueueInfoDto {
  playersCount: number;
  avgRating: number;
  waitingTime: string; //C# TimeSpan
  rating: number;
  ratingDelta: number;
  currentMatchId: string | null;
}
