using MitMediator;
using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Marks;

namespace TaskSolver.Core.Application.Marks.Queries;

public sealed record GetMarkByUserIdAndTaskIdQuery(
    Guid UserId,
    Guid TaskId)
    : IRequest<Result<MarkDto>>;