using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Matches;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Matchmaking;

public sealed class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id)
            .ValueGeneratedNever();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(m => m.Player1Id)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(m => m.Player2Id)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(m => m.WinnerId);

        builder.HasMany(m => m.TaskSlots)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(m => m.SolveRecords)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(m => m.StartedAt)
            .IsRequired();

        builder.Property(m => m.EndsAt)
            .IsRequired();

        builder.Property(m => m.EndedAt);
    }
}
