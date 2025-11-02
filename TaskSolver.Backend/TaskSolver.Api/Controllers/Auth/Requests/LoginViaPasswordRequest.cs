using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record LoginViaPasswordRequest(
    string Email,
    string Password)
{
    public LoginViaPasswordCommand ToCommand()
        => new(Email, Password);
}
