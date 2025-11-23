using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Infrastructure.Persistense.Configurations.ProgrammingLanguages;

public sealed class ProgrammingLanguageConfiguration : IEntityTypeConfiguration<ProgrammingLanguage>
{
    public void Configure(EntityTypeBuilder<ProgrammingLanguage> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.Name)
            .IsRequired();

        builder.Property(l => l.Version)
            .IsRequired();

        builder.Property(l => l.Extra);

        builder.Property(l => l.IconUrl)
            .IsRequired();

        builder.Property(l => l.FileExtension)
            .IsRequired();

        builder.Property(l => l.Interpretor)
            .IsRequired();
    }
}
