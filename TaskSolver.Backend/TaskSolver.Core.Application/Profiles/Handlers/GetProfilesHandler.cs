using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Application.Profiles.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Handlers;

public sealed class GetProfilesHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProfilesQuery, PagedResult<AdminProfileDto>>
{
    public async ValueTask<PagedResult<AdminProfileDto>> HandleAsync(GetProfilesQuery request, CancellationToken cancellationToken)
    {
        var profiles = await unitOfWork.Profiles.GetAllAsync(
            request.Email,
            request.ProfileName,
            request.Page,
            request.PageSize,
            cancellationToken);

        return new PagedResult<AdminProfileDto>(
            profiles.Items.Select(AdminProfileDto.FromEntity),
            profiles.TotalCount);
    }
}
