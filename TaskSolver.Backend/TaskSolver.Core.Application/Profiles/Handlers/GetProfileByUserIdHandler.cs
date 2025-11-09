using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Application.Profiles.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Handlers;

public sealed class GetProfileByUserIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProfileByUserIdQuery, Result<ProfileDto>>
{
    public async ValueTask<Result<ProfileDto>> HandleAsync(GetProfileByUserIdQuery request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.Profiles.GetByUserIdAsync(request.UserId, cancellationToken);
        if (profile is null)
        {
            return Result<ProfileDto>.Fail("Профиль не найден", ErrorCode.NotFound);
        }

        return Result<ProfileDto>.Ok(
            ProfileDto.FromEntity(profile));
    }
}
