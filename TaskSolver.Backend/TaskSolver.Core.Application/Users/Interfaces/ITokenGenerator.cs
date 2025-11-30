using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Interfaces;

public interface ITokenGenerator
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken(User user);
    Result<Guid> GetUserIdFromRefreshToken(string token);
}
