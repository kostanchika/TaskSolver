using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Matches;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Matchmaking;

public sealed class TaskSlotConfiguration : IEntityTypeConfiguration<TaskSlot>
{
    public void Configure(EntityTypeBuilder<TaskSlot> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.TaskId)
            .IsRequired();

        builder.Property(t => t.Order)
            .IsRequired();
    }
}
