using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Matchmaking.Requests;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Application.Matches.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Matchmaking;

[Route("api/matchmaking")]
[ApiController]
public sealed class MatchmakingController(
    IMediator mediator,
    IServiceScopeFactory scopeFactory)
    : ApiBaseController
{
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<MatchDto>> GetMatchAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetMatchByIdQuery(id);

        var result = await mediator.SendAsync<GetMatchByIdQuery, Result<MatchDto>>(
            query,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpPost("{id:guid}/{taskId:guid}")]
    [Authorize]
    public async Task<IActionResult> SendMatchTaskSolutionAsync(
            [FromRoute] Guid id,
            [FromRoute] Guid taskId,
            [FromBody] SendMatchSolutionRequest request,
            CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = request.ToCommand(userId, id, taskId);

        //_ = Task.Run(async () =>
        //{
            //using var scope = scopeFactory.CreateScope();

            //var scopedMediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        //}, CancellationToken.None);
        var result = await mediator.SendAsync<SolveMatchTaskCommand, Result>(
            command,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpGet("queue")]
    [AllowAnonymous]
    public async Task<QueueInfoDto> GetQueueInfoAsync(
        CancellationToken cancellationToken)
    {
        GetQueueInfoQuery query;

        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var playerId))
        {
            query = new GetQueueInfoQuery(playerId);
        }
        else
        {
            query = new GetQueueInfoQuery(null);
        }

        var info = await mediator.SendAsync<GetQueueInfoQuery, QueueInfoDto>(
            query,
            cancellationToken);

        return info;
    }

    [HttpPost("queue/participants")]
    [Authorize]
    public async Task<IActionResult> JoinQueueAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new JoinQueueCommand(userId);

        var result = await mediator.SendAsync<JoinQueueCommand, Result>(
            command,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpDelete("queue/participants")]
    [Authorize]
    public async Task<IActionResult> LeaveQueueAsync(
            CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new LeaveQueueCommand(userId);

        var result = await mediator.SendAsync<LeaveQueueCommand, Result>(
            command,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }
}
