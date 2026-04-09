using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Constructor;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Constructor;

internal sealed class TaskChatConfiguration : IEntityTypeConfiguration<TaskChat>
{
    public void Configure(EntityTypeBuilder<TaskChat> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(c => c.Title).IsRequired();
        builder.Property(c => c.Theme).IsRequired();
        builder.Property(c => c.Difficulty).IsRequired();
        builder.Property(c => c.TaskData);
        builder.Property(c => c.LastCompletedStep).IsRequired();
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();
        builder.Property(c => c.IsArchived).IsRequired();

        builder.OwnsMany(c => c.Messages);
    }
}
