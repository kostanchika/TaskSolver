using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record ResetPasswordRequest(
    string Email,
    string Code,
    string Password)
{
    public ResetPasswordCommand ToCommand()
        => new(Email, Code, Password);
}
