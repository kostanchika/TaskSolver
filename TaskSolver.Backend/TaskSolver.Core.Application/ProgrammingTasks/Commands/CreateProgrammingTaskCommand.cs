using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.ProgrammingTasks.Commands;

public sealed record CreateProgrammingTaskCommand(
    string Name,
    string Description,
    TaskDegree Degree,
    IEnumerable<string> Keywords,
    IEnumerable<TaskInputDto> Input,
    string Output,
    IEnumerable<string> Hints,
    IEnumerable<TaskExampleDto> Examples,
    IEnumerable<TaskTestDto> Tests)
    : IRequest<Guid>;