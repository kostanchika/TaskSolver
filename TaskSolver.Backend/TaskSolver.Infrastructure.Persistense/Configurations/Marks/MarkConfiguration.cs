using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Marks;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Marks;

public sealed class MarkConfiguration : IEntityTypeConfiguration<Mark>
{
    public void Configure(EntityTypeBuilder<Mark> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id)
            .ValueGeneratedNever();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ProgrammingTask>()
            .WithMany()
            .HasForeignKey(m => m.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(m => m.Value)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired();
    }
}
