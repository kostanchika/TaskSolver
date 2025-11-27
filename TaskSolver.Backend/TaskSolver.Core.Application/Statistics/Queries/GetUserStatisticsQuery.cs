using MitMediator;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Statistics.Queries;

public sealed record GetUserStatisticsQuery(
    Guid UserId)
    : IRequest<Result<StatisticsDto>>;