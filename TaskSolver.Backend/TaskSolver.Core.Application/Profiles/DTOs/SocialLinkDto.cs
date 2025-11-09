using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Core.Application.Profiles.DTOs;

public sealed record SocialLinkDto(
    string Platform,
    string Url)
{
    public static SocialLinkDto FromEntity(SocialLink socialLink)
    {
        return new SocialLinkDto(
            socialLink.Platform,
            socialLink.Url);
    }

    public SocialLink ToEntity()
    {
        return new SocialLink(
            Platform,
            Url);
    }
}
