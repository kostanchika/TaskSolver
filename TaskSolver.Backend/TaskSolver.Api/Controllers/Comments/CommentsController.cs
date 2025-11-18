using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Comments.Requests;
using TaskSolver.Core.Application.Comments.Commands;
using TaskSolver.Core.Application.Comments.DTOs;
using TaskSolver.Core.Application.Comments.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Comments;

[Route("api/comments")]
[ApiController]
public sealed class CommentsController(
    IMediator mediator) : ApiBaseController
{
    [HttpGet("task/{taskId:guid}")]
    [AllowAnonymous]
    public async Task<IReadOnlyList<CommentDto>> GetAllByTaskIdAsync(
        [FromRoute] Guid taskId,
        CancellationToken cancellationToken)
    {
        return await mediator.SendAsync<GetCommentsByTaskIdQuery, IReadOnlyList<CommentDto>>(new(taskId), cancellationToken);
    }

    [HttpPost("task/{taskId:guid}")]
    [Authorize]
    public async Task<ActionResult<Guid>> CreateAsync(
        [FromRoute] Guid taskId,
        [FromBody] CreateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = request.ToCommand(userId, taskId);

        var result = await mediator.SendAsync<CreateCommentCommand, Result<Guid>>(command, cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = request.ToCommand(id, userId);

        var result = await mediator.SendAsync<UpdateCommentCommand, Result>(command, cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new DeleteCommentCommand(id, userId);

        var result = await mediator.SendAsync<DeleteCommentCommand, Result>(command, cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return Ok();
    }
}
