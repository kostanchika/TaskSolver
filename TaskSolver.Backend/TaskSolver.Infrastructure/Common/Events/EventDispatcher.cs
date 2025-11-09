using TaskSolver.Core.Domain.Abstractions.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TaskSolver.Infrastructure.Common.Events;

public sealed class EventDispatcher(
    EventQueue queue,
    IServiceProvider provider,
    ILogger<EventDispatcher> logger)
{
    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var @event = await queue.DequeueAsync(cancellationToken);
            if (@event is null) continue;

            using var scope = provider.CreateScope();
            var scopedProvider = scope.ServiceProvider;

            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(@event.GetType());
            var enumerableType = typeof(IEnumerable<>).MakeGenericType(handlerType);
            var handlers = scopedProvider.GetService(enumerableType) as IEnumerable<object>;
            if (handlers is null || !handlers.Any()) continue;

            foreach (var handler in handlers)
            {
                try
                {
                    var method = handlerType.GetMethod("HandleAsync");
                    await (Task)method!.Invoke(handler, [@event])!;
                    logger.LogInformation("Handling {EventType} succeeded by {Handler}", @event.GetType(), handler.GetType().Name);
                }
                catch (Exception ex)
                {
                    logger.LogError("Handling {EventType} failed by {Handler}: {Exception}", @event.GetType(), handler.GetType().Name, ex.Message);
                }
            }
        }
    }

}
