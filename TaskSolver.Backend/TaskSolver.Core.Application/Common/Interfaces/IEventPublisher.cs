using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Application.Common.Interfaces;

public interface IEventPublisher
{
    void Publish(IEnumerable<DomainEvent> events);
}