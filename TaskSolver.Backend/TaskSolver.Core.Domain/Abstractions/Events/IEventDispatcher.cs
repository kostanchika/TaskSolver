using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Abstractions.Events;

public interface IEventDispatcher
{
    Task DispatchAsync(IEnumerable<DomainEvent> events, CancellationToken cancellationToken = default);
}
