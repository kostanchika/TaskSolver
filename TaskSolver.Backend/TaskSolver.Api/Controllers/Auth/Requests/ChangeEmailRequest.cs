using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record ChangeEmailRequest(
    string Email)
{
    public ChangeEmailCommand ToCommand(Guid userId)
        => new(userId, Email);
}
