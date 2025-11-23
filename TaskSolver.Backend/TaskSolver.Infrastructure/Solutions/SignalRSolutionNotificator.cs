using Microsoft.AspNetCore.SignalR;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Infrastructure.Solutions.Hubs;

namespace TaskSolver.Infrastructure.Solutions;
public sealed class SignalRSolutionNotificator(
    IHubContext<SolutionHub> hubContext)
    : ISolutionNotificator
{
    public Task NotifiySolutionCompleted(Guid userId, Guid solutionId, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients
            .User(userId.ToString())
            .SendAsync("SolutionCompleted", solutionId, cancellationToken);
    }
}
