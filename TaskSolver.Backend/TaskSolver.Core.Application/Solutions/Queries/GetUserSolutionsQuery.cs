using MitMediator;
using TaskSolver.Core.Application.Solutions.DTOs;

namespace TaskSolver.Core.Application.Solutions.Queries;

public sealed record GetUserSolutionsQuery(
    Guid UserId,
    Guid TaskId)
    : IRequest<IEnumerable<SolutionDto>>;