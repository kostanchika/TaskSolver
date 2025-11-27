using TaskSolver.Core.Application.Comments.Interfaces;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Marks.Interfaces;
using TaskSolver.Core.Application.Profiles.Interfaces;
using TaskSolver.Core.Application.ProgrammingLanguages.Interfaces;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Application.Statistics;
using TaskSolver.Core.Application.Tasks.Interfaces;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Infrastructure.Persistense.Repositories;

namespace TaskSolver.Infrastructure.Persistense.Contexts;

public sealed class UnitOfWork(
    AppDbContext context,
    IEventPublisher eventPublisher) 
    : IUnitOfWork
{
    private IUserRepository _users = null!;

    private IProfileRepository _profiles = null!;

    private IProgrammingLanguageRepository _programmingLanguages = null!;

    private IProgrammingTaskRepository _programmingTaskRepository = null!;
    private ICommentRepository _commentRepository = null!;
    private IMarkRepository _markRepository = null!;
    private ISolutionRepository _solutionRepository = null!;

    private IStatisticsRepository _statisticsRepository = null!;

    public IUserRepository Users => _users ??= new UserRepository(context);

    public IProfileRepository Profiles => _profiles ??= new ProfileRepository(context);

    public IProgrammingLanguageRepository ProgrammingLanguages => _programmingLanguages ??= new ProgrammingLanguageRepository(context);

    public IProgrammingTaskRepository ProgrammingTasks => _programmingTaskRepository ??= new ProgrammingTaskRepository(context);
    public ICommentRepository Comments => _commentRepository ??= new CommentRepository(context);
    public IMarkRepository Marks => _markRepository ??= new MarkRepository(context);
    public ISolutionRepository Solutions => _solutionRepository ??= new SolutionRepository(context);

    public IStatisticsRepository UserStatistics => _statisticsRepository ??= new StatisticsRepository(context);

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        var savingEntities = context.ChangeTracker.Entries().ToList();

        await context.SaveChangesAsync(cancellationToken);

        foreach (var entity in savingEntities)
        {
            var ag = entity.Entity as AggregateRoot;

            if (ag is not null)
            {
                eventPublisher.Publish(ag.DomainEvents);
            }
        }
    }
}
