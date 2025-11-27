using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Events;
using TaskSolver.Core.Domain.Solutions.Events;

namespace TaskSolver.Core.Application.Statistics.Handlers.Events;

public sealed class TaskSolvedHandler(
    IUnitOfWork unitOfWork)
    : IDomainEventHandler<TaskSolvedEvent>
{
    const int BASE_INCOME = 30;
    const int MIN_INCOME = 10;
    const int MAX_INCOME = 50;

    const int TASK_DEGREE_COST = 300;
    const int DIFF_COEFFICIENT = 20;

    public async Task HandleAsync(TaskSolvedEvent @event)
    {
        var task = await unitOfWork.ProgrammingTasks.GetByIdAsync(@event.TaskId);
        var statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(@event.UserId);

        if (statistics!.TaskHistory.Any(h => h.TaskId == @event.TaskId))
        {
            return;
        }

        if (@event.IsCorrect)
        {
            var difficulty = (int)task!.Degree * TASK_DEGREE_COST;
            var diff = statistics.Rating - difficulty;

            var change = Math.Max(Math.Min(BASE_INCOME - (diff / DIFF_COEFFICIENT), MAX_INCOME), MIN_INCOME);

            statistics.TotalSolutions++;
            if (@event.IsCorrect) statistics.GoodSolutions++;
            statistics.Rating += change;

            statistics.AddHistory(task.Id, change);
        }
        else
        {
            statistics.TotalSolutions++;
        }

        await unitOfWork.CommitAsync();
    }
}
