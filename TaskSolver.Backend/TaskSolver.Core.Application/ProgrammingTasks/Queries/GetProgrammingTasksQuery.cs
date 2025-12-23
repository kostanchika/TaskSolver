using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.ProgrammingTasks.Queries;

public sealed record GetProgrammingTasksQuery(
    string? Name,
    string? Keywords,
    Sigil? Sigil,
    int? MarkFrom,
    int? MarkTo,
    int? Page,
    int? PageSize,
    Guid? UserId)
    : IRequest<PagedResult<ProgrammingTaskWithMarkDto>>;