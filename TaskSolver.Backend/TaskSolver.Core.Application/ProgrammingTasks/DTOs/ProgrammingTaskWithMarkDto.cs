using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.ProgrammingTasks.DTOs;

public sealed record ProgrammingTaskWithMarkDto(
    Guid Id,
    string Name,
    string Description,
    Sigil Degree,
    IEnumerable<string> Keywords,
    IEnumerable<TaskInputDto> Input,
    string Output,
    IEnumerable<string> Hints,
    IEnumerable<TaskExampleDto> Examples,
    IEnumerable<TaskTestDto> Tests,
    double Mark,
    bool IsSolved)
{
    public static ProgrammingTaskWithMarkDto FromEntity(ProgrammingTask programmingTask, double mark)
        => new(
            programmingTask.Id,
            programmingTask.Name,
            programmingTask.Description,
            programmingTask.Degree,
            programmingTask.Keywords,
            programmingTask.Input.Select(TaskInputDto.FromEntity),
            programmingTask.Output,
            programmingTask.Hints,
            programmingTask.Examples.Select(TaskExampleDto.FromEntity),
            programmingTask.Tests.Select(TaskTestDto.FromEntity),
            mark,
            false);
}
