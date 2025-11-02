using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record ConfirmEmailRequest(
    string Email,
    string Code)
{
    public ConfirmEmailCommand ToCommand()
        => new(Email, Code);
}
