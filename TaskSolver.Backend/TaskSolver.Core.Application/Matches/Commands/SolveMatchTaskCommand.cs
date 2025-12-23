using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Commands;

public sealed record SolveMatchTaskCommand(
    Guid UserId,
    Guid MatchId,
    Guid LanguageId,
    Guid TaskId,
    string Code)
    : IRequest<Result>;