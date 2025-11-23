using MitMediator;
using TaskSolver.Core.Application.Marks.DTOs;

namespace TaskSolver.Core.Application.Marks.Queries;

public sealed record GetMarkStatisticsByTaskIdQuery(
    Guid TaskId)
    : IRequest<MarkStatisticsDto>;