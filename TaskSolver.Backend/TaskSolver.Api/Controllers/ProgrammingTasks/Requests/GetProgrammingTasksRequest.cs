using TaskSolver.Core.Application.ProgrammingTasks.Queries;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Api.Controllers.ProgrammingTasks.Requests;

public sealed record GetProgrammingTasksRequest(
    string? Name,
    string? Keywords,
    Sigil? Sigil,
    int? MarkFrom,
    int? MarkTo,
    int? Page,
    int? PageSize)
{
    public GetProgrammingTasksQuery ToQuery(Guid? userId)
        => new(Name, Keywords, Sigil, MarkFrom, MarkTo, Page, PageSize, userId);
}
