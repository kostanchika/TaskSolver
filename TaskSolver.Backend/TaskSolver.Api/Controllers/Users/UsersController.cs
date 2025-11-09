using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Users.Requests;
using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Application.Profiles.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Users;

[Route("api/users")]
[ApiController]
public class UsersController(
    IMediator mediator) : ApiBaseController
{
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ProfileDto>> GetMyProfileAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await mediator.SendAsync<GetProfileByUserIdQuery, Result<ProfileDto>>(
            new GetProfileByUserIdQuery(userId),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProfileDto>> GetProfileByIdAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await mediator.SendAsync<GetProfileByUserIdQuery, Result<ProfileDto>>(
                    new GetProfileByUserIdQuery(id),
                    cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfileAsync(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await mediator.SendAsync<UpdateProfileCommand, Result>(
            request.ToCommand(userId),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpPatch("me/avatar")]
    [Authorize]
    public async Task<IActionResult> UpdateMyAvatarAsync(
        [FromForm] UpdateAvatarRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await mediator.SendAsync<UpdateAvatarCommand, Result>(
            request.ToCommand(userId),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpDelete("me/avatar")]
    [Authorize]
    public async Task<IActionResult> DeleteMyAvatarAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await mediator.SendAsync<DeleteAvatarCommand, Result>(
            new DeleteAvatarCommand(userId),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }
}
