using TaskSolver.Core.Application.Solutions.Commands;

namespace TaskSolver.Api.Controllers.Solutions.Requests;

public sealed record SendSolutionRequest(
    Guid LanguageId,
    string Code)
{
    public SendSolutionCommand ToCommand(Guid userId, Guid taskId)
        => new(userId, taskId, LanguageId, Code);
}