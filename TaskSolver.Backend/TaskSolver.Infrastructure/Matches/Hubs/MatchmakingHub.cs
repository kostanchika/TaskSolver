using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskSolver.Infrastructure.Matches.Hubs;

[Authorize]
public sealed class MatchmakingHub : Hub
{
    public Task JoinMatchAsync(Guid matchId)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, matchId.ToString());
    }

    public Task LeaveMatchAsync(Guid matchId)
    {
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, matchId.ToString());
    }
}
