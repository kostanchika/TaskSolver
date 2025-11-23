using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Marks.Commands;

public sealed record UpsertMarkCommand(
    Guid UserId,
    Guid TaskId,
    int Value)
    : IRequest<Guid>;