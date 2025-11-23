using MitMediator;

namespace TaskSolver.Core.Application.Solutions.Commands;

public sealed record RunTestsCommand(
    Guid UserId,
    Guid TaskId,
    Guid LanguageId,
    string Code)
    : IRequest<Unit>;