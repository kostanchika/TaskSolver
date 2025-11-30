namespace TaskSolver.Core.Application.Statistics.DTOs;

public sealed record TaskStatisticsDto(
    Guid TaskId,
    int TotalSolutions,
    int CorrectSolutions);