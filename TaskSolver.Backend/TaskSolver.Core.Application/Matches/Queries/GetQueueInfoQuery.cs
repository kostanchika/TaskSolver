using MitMediator;
using TaskSolver.Core.Application.Matches.DTOs;

namespace TaskSolver.Core.Application.Matches.Queries;

public sealed record GetQueueInfoQuery(
    Guid? PlayerId)
    : IRequest<QueueInfoDto>;