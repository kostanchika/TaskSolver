namespace TaskSolver.Core.Application.Statistics.DTOs;

public sealed record SolveStatisticsDto(
    int TotalSolutions,
    int CorrectSolutions,
    double AvgSolvedTestsInIncorrectSolution,
    double AvgSolutionTimeSeconds,
    int ActiveUsers,
    IEnumerable<TaskStatisticsDto> TasksStatistics);