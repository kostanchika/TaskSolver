using TaskSolver.Core.Domain.Marks;

namespace TaskSolver.Core.Application.Marks.DTOs;

public sealed record MarkDto(
    Guid UserId,
    Guid TaskId,
    int Value)
{
    public static MarkDto FromEntity(Mark mark)
        => new(mark.UserId, mark.TaskId, mark.Value);
}
