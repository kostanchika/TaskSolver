using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Profiles;

internal sealed class SocialLinkConfiguration : IEntityTypeConfiguration<SocialLink>
{
    public void Configure(EntityTypeBuilder<SocialLink> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.Platform)
            .IsRequired();

        builder.Property(l => l.Url)
            .IsRequired();
    }
}
