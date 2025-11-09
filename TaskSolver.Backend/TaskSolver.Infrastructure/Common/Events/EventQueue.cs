using System.Collections.Concurrent;
using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Infrastructure.Common.Events;

public sealed class EventQueue
{
    private readonly ConcurrentQueue<DomainEvent> _queue = new();
    private readonly SemaphoreSlim _signal = new(0);

    public void Enqueue(DomainEvent @event) 
    {
        _queue.Enqueue(@event);

        _signal.Release();
    }

    public async Task<DomainEvent?> DequeueAsync(CancellationToken cancellationToken = default)
    {
        await _signal.WaitAsync(cancellationToken);

        _queue.TryDequeue(out var @event);

        return @event;
    }
}
