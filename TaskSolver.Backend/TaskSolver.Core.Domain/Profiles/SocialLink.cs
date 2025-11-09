using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Profiles;

public sealed class SocialLink : Entity
{
    public string Platform { get; }
    public string Url { get; }

    private SocialLink()
    {
        Platform = null!;
        Url = null!;
    }

    public SocialLink(string platform, string url)
    {
        Platform = platform;
        Url = url;
    }
}
