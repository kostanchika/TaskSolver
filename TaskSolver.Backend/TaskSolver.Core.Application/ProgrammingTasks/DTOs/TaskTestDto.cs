using TaskSolver.Core.Domain.ProgrammingTasks;

namespace TaskSolver.Core.Application.ProgrammingTasks.DTOs;

public sealed record TaskTestDto(
    string Input,
    string Output,
    bool IsPublic)
{
    public static TaskTestDto FromEntity(TaskTest taskTest)
        => new(taskTest.Input, taskTest.Output, taskTest.IsPublic);

    public TaskTest ToEntity()
        => new(Input, Output, IsPublic);
}
