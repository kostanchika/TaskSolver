using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Core.Application.ProgrammingTasks.DTOs;

public sealed record TaskExampleDto(
    string Input,
    string Output)
{
    public static TaskExampleDto FromEntity(TaskExample taskExample)
        => new(taskExample.Input, taskExample.Output);

    public TaskExample ToEntity()
        => new(Input, Output, "");
}
