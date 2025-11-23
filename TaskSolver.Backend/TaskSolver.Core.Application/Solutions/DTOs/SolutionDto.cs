using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Application.Solutions.DTOs;

public sealed record SolutionDto(
    Guid Id,
    Guid LanguageId,
    Guid UserId,
    Guid TaskId,
    string Code,
    IEnumerable<TestResult> Results,
    DateTime CreatedAt,
    DateTime? CompletedAt)
{
    public static SolutionDto FromEntity(Solution solution)
        => new(
            solution.Id,
            solution.LanguageId,
            solution.UserId,
            solution.TaskId,
            solution.Code,
            solution.Results,
            solution.CreatedAt,
            solution.CompletedAt);
}