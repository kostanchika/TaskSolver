using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Solutions.Commands;

namespace TaskSolver.Api.Controllers.Matchmaking.Requests;

public sealed record SendMatchSolutionRequest(
    Guid LanguageId,
    string Code)
{
    public SolveMatchTaskCommand ToCommand(Guid userId, Guid matchId, Guid taskId)
        => new(userId, matchId, LanguageId, taskId, Code);
}