using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Auth.Requests;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Api.Controllers.Auth;

[Route("api/auth")]
[ApiController]
public class AuthController(IMediator mediator) : ApiBaseController
{
    [HttpGet("signin-github")]
    public IActionResult SignInGithub()
    {
        return Challenge(new AuthenticationProperties { RedirectUri = "/api/auth/oauth-callback" }, "GitHub");
    }

    [HttpGet("signin-google")]
    public IActionResult SignInGoogle()
    {
        return Challenge(new AuthenticationProperties { RedirectUri = "/api/auth/oauth-callback" }, "Google");
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> RegisterAsync(
        [FromBody] RegisterViaPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var result = await mediator.SendAsync<RegisterViaPasswordCommand, Result<AuthResponseDto>>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> LoginAsync(
        [FromBody] LoginViaPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var result = await mediator.SendAsync<LoginViaPasswordCommand, Result<AuthResponseDto>>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok(result.Value);
    }

    [HttpPatch("email")]
    [Authorize]
    public async Task<IActionResult> ChangeEmailAsync(
        [FromBody] ChangeEmailRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = request.ToCommand(userId);

        var result = await mediator.SendAsync<ChangeEmailCommand, Result>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpPost("request-email-confirmation")]
    [Authorize]
    public async Task<IActionResult> RequestEmailConfirmationAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new RequestEmailConfirmationCommand(userId);

        var result = await mediator.SendAsync<RequestEmailConfirmationCommand, Result>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpPost("confirm-email")]
    [Authorize]
    public async Task<IActionResult> ConfirmEmailAsync(
        [FromBody] ConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var result = await mediator.SendAsync<ConfirmEmailCommand, Result>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpPost("request-password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestPasswordResetAsync(
        [FromBody] RequestPasswordResetRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var result = await mediator.SendAsync<RequestResetPasswordCommand, Result>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpPatch("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var result = await mediator.SendAsync<ResetPasswordCommand, Result>(
            command,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }
}
