namespace TaskSolver.Core.Application.Matches.DTOs;

public sealed record QueueParticipantDto(
    Guid PlayerId,
    int Rating,
    DateTime JoinedAt);