using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Profiles.Interfaces;
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

    public IUserRepository Users => _users ??= new UserRepository(context);

    public IProfileRepository Profiles => _profiles ??= new ProfileRepository(context);

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
