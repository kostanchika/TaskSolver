using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Infrastructure.Common.Events;

public sealed class EventPublisher(EventQueue queue)
    : IEventPublisher
{
    public void Publish(IEnumerable<DomainEvent> events)
    {
        foreach (var @event in events)
        {
            queue.Enqueue(@event);
        }
    }
}
