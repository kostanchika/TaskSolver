using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users;

public sealed class ExternalLogin : Entity
{
    public string Provider { get; }
    public string ExternalId { get; }
    public string Email { get; }

    public ExternalLogin(string provider, string externalId, string email)
    {
        Provider = provider;
        ExternalId = externalId;
        Email = email;
    }
}
