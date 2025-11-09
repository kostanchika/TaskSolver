using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Profiles.Exceptions;
using TaskSolver.Core.Domain.Abstractions.Events;
using TaskSolver.Core.Domain.Profiles;
using TaskSolver.Core.Domain.Users.Events;

namespace TaskSolver.Core.Application.Profiles.Handlers.Events;

public sealed class UserCreatedHandler(
    IUnitOfWork unitOfWork)
    : IDomainEventHandler<UserCreatedEvent>
{
    public async Task HandleAsync(UserCreatedEvent @event)
    {
        var user = await unitOfWork.Users.GetByIdAsync(@event.Id);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        var profile = new Profile(user, @event.Email);

        await unitOfWork.Profiles.AddAsync(profile);
        await unitOfWork.CommitAsync();
    }
}
