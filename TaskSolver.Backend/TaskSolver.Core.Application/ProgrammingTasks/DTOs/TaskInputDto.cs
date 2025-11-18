using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Core.Application.ProgrammingTasks.DTOs;

public sealed record TaskInputDto(
    string Name,
    string Type,
    string Constraints,
    string Description)
{
    public static TaskInputDto FromEntity(TaskInput taskInput)
        => new(
            taskInput.Name,
            taskInput.Type,
            taskInput.Constraints,
            taskInput.Description);

    public TaskInput ToEntity()
        => new(
            Name,
            Type,
            Constraints,
            Description);
}
