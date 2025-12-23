using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Commands;

public sealed record JoinQueueCommand(
    Guid PlayerId)
    : IRequest<Result>;