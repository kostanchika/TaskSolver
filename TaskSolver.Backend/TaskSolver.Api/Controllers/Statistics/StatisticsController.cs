using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using System.Text;
using TaskSolver.Api.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users.Constants;

namespace TaskSolver.Api.Controllers.Statistics;

[Route("api/statistics")]
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

    [HttpGet("admin")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<SolveStatisticsDto> GetSolveStatisticsAsync(
        CancellationToken cancellationToken)
    {
        var query = new GetSolveStatisticsQuery();

        return await mediator.SendAsync<GetSolveStatisticsQuery, SolveStatisticsDto>(
            query,
            cancellationToken);
    }

    [HttpGet("resources")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<IActionResult> GetRunnerServerResources(
        [FromServices] IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        using var httpClient = new HttpClient();

        var coderunner = configuration["CodeRunner:Url"];

        if (coderunner is null)
        {
            return StatusCode(500, "Execution Server url was not found");
        }

        var response = await httpClient.GetAsync(configuration["CodeRunner:Url"] + "/status", cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode((int)response.StatusCode,
                $"Ошибка при получении данных от Runner сервера: {response.ReasonPhrase}");
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);

        return Content(content, "application/json");
    }

    [HttpGet("logs")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<IActionResult> GetLogsAsync(CancellationToken cancellationToken)
    {
        var logDir = "Logs";
        var latestLogFile = Directory.GetFiles(logDir, "log-*.txt")
                                     .OrderByDescending(f => f)
                                     .FirstOrDefault();

        if (latestLogFile is null)
            return NotFound("Лог-файл не найден");

        var lines = await System.IO.File.ReadAllLinesAsync(latestLogFile, cancellationToken);

        return Content(string.Join(Environment.NewLine, lines), "text/plain", Encoding.UTF8);
    }
}
