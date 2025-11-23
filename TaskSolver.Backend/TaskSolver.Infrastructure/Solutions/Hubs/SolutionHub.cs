using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskSolver.Infrastructure.Solutions.Hubs;

[Authorize]
public sealed class SolutionHub : Hub
{
}
