using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Profiles;

internal sealed class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .ValueGeneratedNever();

        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<Profile>("UserId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.ProfileName)
            .IsRequired();

        builder.Property(p => p.AvatarUrl);
        builder.Property(p => p.Bio);
        builder.Property(p => p.Description);

        builder.HasMany(p => p.SocialLinks)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.Skills)
            .IsRequired();
    }
}
