using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Comments;
using TaskSolver.Core.Domain.Marks;
using TaskSolver.Core.Domain.Profiles;
using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure.Persistense.Configurations.Users;

namespace TaskSolver.Infrastructure.Persistense.Contexts;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Profile> Profiles => Set<Profile>();

    public DbSet<ProgrammingLanguage> ProgrammingLanguages => Set<ProgrammingLanguage>();

    public DbSet<ProgrammingTask> ProgrammingTasks => Set<ProgrammingTask>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Mark> Marks => Set<Mark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);

        modelBuilder.Ignore<DomainEvent>();
    }
}
