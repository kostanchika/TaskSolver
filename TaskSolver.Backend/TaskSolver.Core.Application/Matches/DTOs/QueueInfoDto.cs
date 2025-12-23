namespace TaskSolver.Core.Application.Matches.DTOs;

public sealed record QueueInfoDto(
    int PlayersCount,
    int AvgRating,
    TimeSpan? WaitingTime,
    int? Rating,
    int? RatingDelta,
    Guid? CurrentMatchId);