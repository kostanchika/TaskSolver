namespace TaskSolver.Core.Domain.Abstractions.Common;

public abstract record DomainEvent()
{
    public DateTime OccuredOn { get; } = DateTime.UtcNow;
}
