using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Statistics.Queries;

public sealed record GetRecommendedTaskQuery(
    Guid UserId)
    : IRequest<Result<ProgrammingTaskDto>>;