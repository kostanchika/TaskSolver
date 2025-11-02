using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure.Persistense.Configurations.Users;

namespace TaskSolver.Infrastructure.Persistense.Contexts;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);

        modelBuilder.Ignore<DomainEvent>();
    }
}
