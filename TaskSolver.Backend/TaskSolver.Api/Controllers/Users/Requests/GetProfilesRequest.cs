using TaskSolver.Core.Application.Profiles.Queries;

namespace TaskSolver.Api.Controllers.Users.Requests;

public sealed record GetProfilesRequest(
    string? Email,
    string? ProfileName,
    int? Page,
    int? PageSize)
{
    public GetProfilesQuery ToQuery()
        => new(Email, ProfileName, Page, PageSize);
}
