using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Infrastructure.Persistense.Configurations.ProgrammingTasks;

public sealed class ProgrammingTaskConfiguration : IEntityTypeConfiguration<ProgrammingTask>
{
    public void Configure(EntityTypeBuilder<ProgrammingTask> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.Name)
            .IsRequired();

        builder.Property(t => t.Description)
            .IsRequired();

        builder.Property(t => t.Degree)
            .IsRequired();

        builder.Property(t => t.Keywords)
            .IsRequired();

        builder.HasMany(t => t.Input)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(t => t.Output)
            .IsRequired();

        builder.Property(t => t.Hints)
            .IsRequired();

        builder.HasMany(t => t.Examples)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Tests)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
