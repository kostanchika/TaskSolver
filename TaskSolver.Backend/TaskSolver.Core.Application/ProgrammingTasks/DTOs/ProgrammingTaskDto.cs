using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.ProgrammingTasks.DTOs;

public sealed record ProgrammingTaskDto(
    Guid Id,
    string Name,
    string Description,
    Sigil Degree,
    IEnumerable<string> Keywords,
    IEnumerable<TaskInputDto> Input,
    string Output,
    IEnumerable<string> Hints,
    IEnumerable<TaskExampleDto> Examples,
    IEnumerable<TaskTestDto> Tests)
{
    public static ProgrammingTaskDto FromEntity(ProgrammingTask programmingTask)
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
            programmingTask.Tests.Select(TaskTestDto.FromEntity));
}
