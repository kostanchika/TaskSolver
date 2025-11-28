using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Core.Application.Consulting.Interfaces;

public interface ITaskConsultant
{
    Task<string> GetTaskDescriptionAsync(ProgrammingTask task, CancellationToken cancellationToken = default);
    Task<string> AnswerQuestionAsync(
        ProgrammingTask task,
        string question,
        IEnumerable<string> context,
        CancellationToken cancellationToken = default);
}
