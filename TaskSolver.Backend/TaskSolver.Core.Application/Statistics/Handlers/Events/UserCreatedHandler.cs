using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Events;
using TaskSolver.Core.Domain.Statistics;
using TaskSolver.Core.Domain.Users.Events;

namespace TaskSolver.Core.Application.Statistics.Handlers.Events;

public sealed class UserCreatedHandler(
    IUnitOfWork unitOfWork)
    : IDomainEventHandler<UserCreatedEvent>
{
    public async Task HandleAsync(UserCreatedEvent @event)
    {
        var user = await unitOfWork.Users.GetByIdAsync(@event.Id);

        var statistics = new UserStatistics(user!);

        await unitOfWork.UserStatistics.AddAsync(statistics);
        await unitOfWork.CommitAsync();
    }
}
