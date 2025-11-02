namespace TaskSolver.Core.Domain.Abstractions.Common;

public abstract class Entity
{
    public Guid Id { get; } = Guid.NewGuid();
}
