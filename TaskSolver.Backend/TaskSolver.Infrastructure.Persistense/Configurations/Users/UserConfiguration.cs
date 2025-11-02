using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Users;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .ValueGeneratedNever();

        builder.Property(u => u.Email)
            .IsRequired();
        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.Role)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .IsRequired();
    }
}
