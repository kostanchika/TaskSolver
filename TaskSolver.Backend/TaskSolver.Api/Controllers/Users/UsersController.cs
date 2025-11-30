using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Users.Requests;
using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Application.Profiles.Queries;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users.Constants;

namespace TaskSolver.Api.Controllers.Users;

[Route("api/users")]
[ApiController]
public class UsersController(
    IMediator mediator) : ApiBaseController
{
    [HttpGet]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<PagedResult<AdminProfileDto>> GetAllProfilesAsync(
        [FromQuery] GetProfilesRequest request,
        CancellationToken cancellationToken)
    {
        var query = request.ToQuery();

        var pagedResult = await mediator.SendAsync<GetProfilesQuery, PagedResult<AdminProfileDto>> (
            query,
            cancellationToken);

        return pagedResult;
    }

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

    [HttpPut("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<IActionResult> UpdateUserProfileAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.SendAsync<UpdateProfileCommand, Result>(
            request.ToCommand(id),
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

    [HttpPatch("{id:guid}/avatar")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<IActionResult> UpdateUserAvatarAsync(
        [FromRoute] Guid id,
        [FromForm] UpdateAvatarRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.SendAsync<UpdateAvatarCommand, Result>(
            request.ToCommand(id),
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

    [HttpDelete("{id:guid}/avatar")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<IActionResult> DeleteUserAvatarAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await mediator.SendAsync<DeleteAvatarCommand, Result>(
            new DeleteAvatarCommand(id),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpDelete("me")]
    [Authorize]
    public Task DeleteMyAccountAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        return DeleteUserAccountByIdAsync(userId, cancellationToken);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task DeleteUserAccountByIdAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await mediator.SendAsync<DeleteUserCommand, Result>(
            new DeleteUserCommand(id),
            cancellationToken);
    }
}
