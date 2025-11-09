using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Abstractions.Events;

public interface IDomainEventHandler<TEvent> where TEvent : DomainEvent
{
    Task HandleAsync(TEvent @event);
}
