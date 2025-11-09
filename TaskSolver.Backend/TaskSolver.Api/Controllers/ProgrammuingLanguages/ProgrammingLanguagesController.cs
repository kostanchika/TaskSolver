using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.ProgrammuingLanguages.Requests;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;
using TaskSolver.Core.Application.ProgrammingLanguages.DTOs;
using TaskSolver.Core.Application.ProgrammingLanguages.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Core.Domain.Users.Constants;

namespace TaskSolver.Api.Controllers.ProgrammuingLanguages;

[Route("api/[controller]")]
[ApiController]
public class ProgrammingLanguagesController(IMediator mediator)
    : ApiBaseController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IReadOnlyList<ProgrammingLanguageDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await mediator.SendAsync<GetAllProgrammingLanguagesQuery, IReadOnlyList<ProgrammingLanguageDto>>(new(), cancellationToken);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProgrammingLanguageDto>> GetByIdAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await mediator.SendAsync<GetProgrammingLanguageByIdQuery, Result<ProgrammingLanguageDto>>(
            new GetProgrammingLanguageByIdQuery(id),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<ActionResult<ProgrammingLanguageDto>> CreateAsync(
        [FromForm] CreateProgrammingLanguageRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var id = await mediator.SendAsync<CreateProgrammingLanguageCommand, Guid>(command, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<ActionResult<ProgrammingLanguageDto>> UpdateAsync(
        [FromRoute] Guid id,
        [FromForm] UpdateProgrammingLanguageRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand(id);

        await mediator.SendAsync<UpdateProgrammingLanguageCommand, Result>(command, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task DeleteAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteProgrammingLanguageCommand(id);

        await mediator.SendAsync<DeleteProgrammingLanguageCommand, Result>(command, cancellationToken);
    }
}
