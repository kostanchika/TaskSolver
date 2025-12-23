using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Matches;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Matchmaking;

public sealed class SolveRecordConfiguration : IEntityTypeConfiguration<SolveRecord>
{
    public void Configure(EntityTypeBuilder<SolveRecord> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.UserId)
            .IsRequired();

        builder.Property(s => s.TaskId)
            .IsRequired();

        builder.Property(s => s.IsCompleted)
            .IsRequired();

        builder.Property(s => s.SolvedAt)
            .IsRequired();

        builder.Property(s => s.Code)
            .IsRequired();

        builder.HasMany(s => s.Results)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
