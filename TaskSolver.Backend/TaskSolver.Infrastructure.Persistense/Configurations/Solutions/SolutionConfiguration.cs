using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Solutions;

public sealed class SolutionConfiguration : IEntityTypeConfiguration<Solution>
{
    public void Configure(EntityTypeBuilder<Solution> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ProgrammingLanguage>()
            .WithMany()
            .HasForeignKey(s => s.LanguageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ProgrammingTask>()
            .WithMany()
            .HasForeignKey(s => s.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(s => s.Code)
            .IsRequired();

        builder.HasMany(s => s.Results)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.CompletedAt);
    }
}
