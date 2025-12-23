using Microsoft.AspNetCore.SignalR;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Infrastructure.Matches.Hubs;

namespace TaskSolver.Infrastructure.Matches;

public sealed class SignalRMatchmakingNotificator(
    IHubContext<MatchmakingHub> hubContext)
    : IMatchmakingNotificator
{
    public Task NotifyMatchStartedAsync(Guid matchId, Guid player1Id, Guid player2Id, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.Users([player1Id.ToString(), player2Id.ToString()])
            .SendAsync("MatchStarted", matchId, cancellationToken: cancellationToken);
    }

    public Task NotifyMatchUpdatedAsync(Guid player1Id, Guid player2Id, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.Users([player1Id.ToString(), player2Id.ToString()])
            .SendAsync("MatchUpdated", cancellationToken: cancellationToken);
    }

    public Task NotifyUpdateQueueAsync(CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All
            .SendAsync("QueueUpdated", cancellationToken);
    }
}
