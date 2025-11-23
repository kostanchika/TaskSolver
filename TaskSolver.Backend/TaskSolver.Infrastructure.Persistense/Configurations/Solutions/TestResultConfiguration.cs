using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Infrastructure.Persistense.Configurations.Solutions;

public sealed class TestResultConfiguration : IEntityTypeConfiguration<TestResult>
{
    public void Configure(EntityTypeBuilder<TestResult> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.Input)
            .IsRequired();

        builder.Property(t => t.IsPublic)
            .IsRequired();

        builder.Property(t => t.Stdout)
            .IsRequired();

        builder.Property(t => t.Stderr)
            .IsRequired();

        builder.Property(t => t.IsSovled)
            .IsRequired();
    }
}
