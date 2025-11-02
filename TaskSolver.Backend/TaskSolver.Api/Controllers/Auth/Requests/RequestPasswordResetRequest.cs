using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record RequestPasswordResetRequest(
    string Email)
{
    public RequestResetPasswordCommand ToCommand()
        => new(Email);
}
