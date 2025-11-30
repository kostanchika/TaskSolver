using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Api.Controllers.Auth.Requests;

public sealed record RefreshTokensRequest(
    string RefreshToken)
{
    public RefreshTokensCommand ToCommand()
        => new(RefreshToken);
}
