using MitMediator;
using TaskSolver.Core.Application.Statistics.DTOs;

namespace TaskSolver.Core.Application.Statistics.Queries;

public sealed record GetLeaderboardQuery()
    : IRequest<IEnumerable<StatisticsDto>>;