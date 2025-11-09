using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Domain.Profiles;

public sealed class Profile : AggregateRoot
{
    public User User { get; }

    public string ProfileName { get; set; }
    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }
    public string? Description { get; set; }

    public List<string> Skills { get; set; }

    public List<SocialLink> SocialLinks { get; set; }

    public DateTime CreatedAt { get; }

    private Profile()
    {
        User = null!;
        ProfileName = null!;
        Skills = null!;
        SocialLinks = null!;
    }

    public Profile(
        User user,
        string profileName)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(profileName);

        User = user;
        ProfileName = profileName;
        Skills = [];
        SocialLinks = [];
        CreatedAt = DateTime.UtcNow;
    }
}
