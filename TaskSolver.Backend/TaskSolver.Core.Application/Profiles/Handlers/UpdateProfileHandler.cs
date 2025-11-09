using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Handlers;

public sealed class UpdateProfileHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProfileCommand, Result>
{
    public async ValueTask<Result> HandleAsync(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.Profiles.GetByUserIdAsync(request.UserId, cancellationToken);
        if (profile is null)
        {
            return Result.Fail("Профиль не найден", ErrorCode.NotFound);
        }

        profile.ProfileName = request.ProfileName;
        profile.Bio = request.Bio;
        profile.Description = request.Description;
        profile.Skills = [.. request.Skills];
        profile.SocialLinks = [.. request.SocialLinks.Select(l => l.ToEntity())];

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
