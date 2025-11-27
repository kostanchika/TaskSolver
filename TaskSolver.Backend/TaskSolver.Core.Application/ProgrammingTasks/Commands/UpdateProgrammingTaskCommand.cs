using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.ProgrammingTasks.Commands;

public sealed record UpdateProgrammingTaskCommand(
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
    : IRequest<Result>;