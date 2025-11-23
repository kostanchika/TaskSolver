using TaskSolver.Core.Application.Marks.Commands;

namespace TaskSolver.Api.Controllers.Marks.Requests;

public sealed record UpsertMarkRequest(
    int Value)
{
    public UpsertMarkCommand ToCommand(Guid userId, Guid taskId)
        => new(userId, taskId, Value);
}
