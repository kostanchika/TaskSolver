using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Statistics;

[Route("api/[controller]")]
[ApiController]
public sealed class StatisticsController(IMediator mediator)
    : ApiBaseController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IEnumerable<StatisticsDto>> GetLeaderboardAsync(
        CancellationToken cancellationToken) 
    {
        var query = new GetLeaderboardQuery();

        var leaderboard = await mediator.SendAsync<GetLeaderboardQuery, IEnumerable<StatisticsDto>>(
            query,
            cancellationToken);

        return leaderboard;
    }

    [HttpGet("{userId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<StatisticsDto>> GetStatisticsByUserIdAsync(
        [FromRoute] Guid userId,
        CancellationToken cancellationToken)
    {
        var query = new GetUserStatisticsQuery(userId);

        var result = await mediator.SendAsync<GetUserStatisticsQuery, Result<StatisticsDto>>(
            query,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<StatisticsDto>> GetUserStatisticsAsync(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new GetUserStatisticsQuery(userId);

        var result = await mediator.SendAsync<GetUserStatisticsQuery, Result<StatisticsDto>>(
            query,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpGet("my/recommendation")]
    [Authorize]
    public async Task<ActionResult<ProgrammingTaskDto>> GetRecommendedTask(
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new GetRecommendedTaskQuery(userId);

        var result = await mediator.SendAsync<GetRecommendedTaskQuery, Result<ProgrammingTaskDto>>(
            query,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }
}
