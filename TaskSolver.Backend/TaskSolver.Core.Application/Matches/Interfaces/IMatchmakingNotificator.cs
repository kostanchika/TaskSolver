namespace TaskSolver.Core.Application.Matches.Interfaces;

public interface IMatchmakingNotificator
{
    Task NotifyUpdateQueueAsync(CancellationToken cancellationToken = default);
    Task NotifyMatchUpdatedAsync(
        Guid player1Id,
        Guid player2Id,
        CancellationToken cancellationToken = default);
    Task NotifyMatchStartedAsync(
        Guid matchId,
        Guid player1Id,
        Guid player2Id,
        CancellationToken cancellationToken = default);
}
