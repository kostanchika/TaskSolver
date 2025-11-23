using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Marks.Requests;
using TaskSolver.Api.Controllers.Marks.Responses;
using TaskSolver.Core.Application.Marks.Commands;
using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Application.Marks.Handlers;
using TaskSolver.Core.Application.Marks.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Marks;

[Route("api/marks")]
[ApiController]
public sealed class MarksController(IMediator mediator)
    : ApiBaseController
{
    [HttpGet("task/{taskId:guid}")]
    [AllowAnonymous]
    public async Task<MarksStatisticsResponse> GetStatisticsAsync(
        [FromRoute] Guid taskId,
        CancellationToken cancellationToken)
    {
        int? userMark = null;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is not null)
        {
            var userQuery = new GetMarkByUserIdAndTaskIdQuery(
                Guid.Parse(userId),
                taskId);

            var userResult = await mediator.SendAsync<GetMarkByUserIdAndTaskIdQuery, Result<MarkDto>>(
                userQuery,
                cancellationToken);

            if (userResult.IsSuccess)
            {
                userMark = userResult.Value.Value;
            }
        }

        var taskQuery = new GetMarkStatisticsByTaskIdQuery(taskId);

        var statistics = await mediator.SendAsync<GetMarkStatisticsByTaskIdQuery, MarkStatisticsDto>(
            taskQuery,
            cancellationToken);

        var response = new MarksStatisticsResponse(
            statistics.MarksSum,
            statistics.TotalCount,
            userMark);

        return response;
    }

    [HttpPut("task/{taskId:guid}")]
    [Authorize]
    public async Task UpsertAsync(
        [FromRoute] Guid taskId,
        [FromBody] UpsertMarkRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = request.ToCommand(userId, taskId);

        await mediator.SendAsync<UpsertMarkCommand, Guid>(command, cancellationToken);
    }

    [HttpDelete("task/{taskId:guid}")]
    [Authorize]
    public async Task<IActionResult> RemoveAsync(
        [FromRoute] Guid taskId,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new DeleteMarkCommand(userId, taskId);

        var result = await mediator.SendAsync<DeleteMarkCommand, Result>(command, cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }
}
