using TaskSolver.Core.Application.ProgrammingTasks.Commands;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Api.Controllers.ProgrammingTasks.Requests;

public sealed record UpdateProgrammingTaskRequest(
    string Name,
    string Description,
    TaskDegree Degree,
    IEnumerable<string> Keywords,
    IEnumerable<TaskInputDto> Input,
    string Output,
    IEnumerable<string> Hints,
    IEnumerable<TaskExampleDto> Examples,
    IEnumerable<TaskTestDto> Tests)
{
    public UpdateProgrammingTaskCommand ToCommand(Guid id)
        => new(
            id,
            Name,
            Description,
            Degree,
            Keywords,
            Input,
            Output,
            Hints,
            Examples,
            Tests);
}
