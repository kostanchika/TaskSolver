using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Statistics;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Statistics;

public sealed class TaskRatingHistoryConfiguration : IEntityTypeConfiguration<TaskRatingHistory>
{
    public void Configure(EntityTypeBuilder<TaskRatingHistory> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        // Задача может быть удалены, в истории оставляем
        builder.Property(t => t.TaskId)
            .IsRequired();

        builder.Property(t => t.Difference)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .IsRequired();
    }
}
