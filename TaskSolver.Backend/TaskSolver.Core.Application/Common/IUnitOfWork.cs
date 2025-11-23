using TaskSolver.Core.Application.Comments.Interfaces;
using TaskSolver.Core.Application.Marks.Interfaces;
using TaskSolver.Core.Application.Profiles.Interfaces;
using TaskSolver.Core.Application.ProgrammingLanguages.Interfaces;
using TaskSolver.Core.Application.Tasks.Interfaces;
using TaskSolver.Core.Application.Users.Interfaces;

namespace TaskSolver.Core.Application.Common;

public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IProfileRepository Profiles { get; }
    IProgrammingLanguageRepository ProgrammingLanguages { get; }
    IProgrammingTaskRepository ProgrammingTasks { get; }
    ICommentRepository Comments { get; }
    IMarkRepository Marks { get; }

    Task CommitAsync(CancellationToken cancellationToken = default);
}
