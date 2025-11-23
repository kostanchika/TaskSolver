using MitMediator;

namespace TaskSolver.Core.Application.Solutions.Commands;

public sealed record SendSolutionCommand(
    Guid UserId,
    Guid TaskId,
    Guid LanguageId,
    string Code)
    : IRequest<Guid>;