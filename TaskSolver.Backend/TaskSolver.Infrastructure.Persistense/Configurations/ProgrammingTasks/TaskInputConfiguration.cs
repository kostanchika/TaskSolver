using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Infrastructure.Persistense.Configurations.ProgrammingTasks;

public sealed class TaskInputConfiguration : IEntityTypeConfiguration<TaskInput>
{
    public void Configure(EntityTypeBuilder<TaskInput> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id)
            .ValueGeneratedNever();

        builder.Property(i => i.Name)
            .IsRequired();

        builder.Property(i => i.Type)
            .IsRequired();

        builder.Property(i => i.Constraints)
            .IsRequired();

        builder.Property(i => i.Description)
            .IsRequired();
    }
}
