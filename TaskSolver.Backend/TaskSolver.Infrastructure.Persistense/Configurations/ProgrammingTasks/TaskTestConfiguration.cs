using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.ProgrammingTasks;

namespace TaskSolver.Infrastructure.Persistense.Configurations.ProgrammingTasks;

public sealed class TaskTestConfiguration : IEntityTypeConfiguration<TaskTest>
{
    public void Configure(EntityTypeBuilder<TaskTest> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.Input)
            .IsRequired();

        builder.Property(t => t.Output)
            .IsRequired();

        builder.Property(t => t.IsPublic)
            .IsRequired();
    }
}
