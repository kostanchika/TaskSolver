using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Users;

internal sealed class ExternalLoginConfiguration : IEntityTypeConfiguration<ExternalLogin>
{
    public void Configure(EntityTypeBuilder<ExternalLogin> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.Provider)
            .IsRequired();

        builder.Property(l => l.ExternalId)
            .IsRequired();

        builder.Property(l => l.Email)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany(u => u.ExternalLogins)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
