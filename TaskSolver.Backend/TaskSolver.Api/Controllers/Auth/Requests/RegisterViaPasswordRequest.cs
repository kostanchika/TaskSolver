using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record RegisterViaPasswordRequest(
    string Email,
    string Password)
{
    public RegisterViaPasswordCommand ToCommand()
        => new(Email, Password);
}
