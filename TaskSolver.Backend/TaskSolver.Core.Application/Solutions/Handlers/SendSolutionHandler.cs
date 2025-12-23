using MitMediator;
using System.Net.Http.Json;
using System.Text.Json;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.Commands;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Application.Solutions.Handlers;

public sealed class SendSolutionHandler(
    IUnitOfWork unitOfWork,
    ISolutionNotificator solutionNotificator,
    ICodeRunner codeRunner)
    : IRequestHandler<SendSolutionCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> HandleAsync(SendSolutionCommand request, CancellationToken cancellationToken)
    {
        var solution = new Solution(
            request.LanguageId,
            request.UserId,
            request.TaskId,
            request.Code);

        await unitOfWork.Solutions.AddAsync(solution, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        await solutionNotificator.NotifiySolutionCompleted(request.UserId, solution.Id, cancellationToken);

        var task = await unitOfWork.ProgrammingTasks.GetByIdAsync(
            request.TaskId,
            cancellationToken);
        if (task is null)
        {
            return Result<Guid>.Fail("Задача не найдена", ErrorCode.NotFound);
        }

        var language = await unitOfWork.ProgrammingLanguages.GetByIdAsync(
            request.LanguageId,
            cancellationToken);
        if (language is null)
        {
            return Result<Guid>.Fail("Язык не найден", ErrorCode.NotFound);
        }

        var results = await codeRunner.RunTestsAsync(task, language, request.Code, cancellationToken);

        solution.Complete(results);

        await unitOfWork.CommitAsync(CancellationToken.None);

        await solutionNotificator.NotifiySolutionCompleted(request.UserId, solution.Id, CancellationToken.None);

        return Result.Ok(solution.Id);
    }
}
