using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Statistics;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Statistics;

public sealed class UserStatisticsConfiguration : IEntityTypeConfiguration<UserStatistics>
{
    public void Configure(EntityTypeBuilder<UserStatistics> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.HasOne(s => s.User)
            .WithOne()
            .HasForeignKey<UserStatistics>("UserId") 
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(s => s.Rating)
            .IsRequired();

        builder.Property(s => s.TotalSolutions)
            .IsRequired();

        builder.Property(s => s.GoodSolutions)
            .IsRequired();

        builder.HasMany(s => s.TaskHistory)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
    }
}
