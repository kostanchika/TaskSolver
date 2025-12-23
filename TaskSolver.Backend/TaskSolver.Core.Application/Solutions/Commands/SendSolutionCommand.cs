using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Solutions.Commands;

public sealed record SendSolutionCommand(
    Guid UserId,
    Guid TaskId,
    Guid LanguageId,
    string Code)
    : IRequest<Result<Guid>>;