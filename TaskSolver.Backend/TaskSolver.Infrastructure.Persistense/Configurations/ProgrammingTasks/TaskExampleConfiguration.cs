using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Infrastructure.Persistense.Configurations.ProgrammingTasks;

public sealed class TaskExampleConfiguration : IEntityTypeConfiguration<TaskExample>
{
    public void Configure(EntityTypeBuilder<TaskExample> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.Input)
            .IsRequired();

        builder.Property(t => t.Output)
            .IsRequired();
    }
}
