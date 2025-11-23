using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Marks.Commands;

public sealed record DeleteMarkCommand(
    Guid UserId,
    Guid TaskId)
    : IRequest<Result>;