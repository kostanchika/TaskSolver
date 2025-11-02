using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Interfaces;

public interface IEmailSender
{
    Task SendResetPasswordEmailAsync(User user, CancellationToken cancellationToken = default);
    Task SendConfirmationEmailAsync(User user, CancellationToken cancellationToken = default);
}
