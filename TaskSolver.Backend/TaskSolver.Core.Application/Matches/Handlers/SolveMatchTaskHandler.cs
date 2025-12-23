using MitMediator;
using System.Net.Http.Json;
using System.Text.Json;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class SolveMatchTaskHandler(
    IUnitOfWork unitOfWork,
    IMatchmakingNotificator matchmakingNotificator,
    ICodeRunner codeRunner)
    : IRequestHandler<SolveMatchTaskCommand, Result>
{
    public async ValueTask<Result> HandleAsync(SolveMatchTaskCommand request, CancellationToken cancellationToken)
    {
        var match = await unitOfWork.Matches.GetByIdAsync(request.MatchId, cancellationToken);
        if (match is null)
        {
            return Result.Fail("Матч не найден", ErrorCode.NotFound);
        }

        if (!match.TaskSlots.Any(t => t.TaskId == request.TaskId))
        {
            return Result.Fail("В данном матче нет такой задачи", ErrorCode.Conflict);
        }

        if (match.SolveRecords.Any(r =>
            r.UserId == request.UserId &&
            r.TaskId == request.TaskId &&
            r.IsCompleted))
        {
            return Result.Fail("Вы уже решили данную задачу", ErrorCode.Conflict);
        }

        var task = await unitOfWork.ProgrammingTasks.GetByIdAsync(request.TaskId, cancellationToken);
        if (task is null)
        {
            return Result.Fail("Задача не найдена", ErrorCode.NotFound);
        }
        var language = await unitOfWork.ProgrammingLanguages.GetByIdAsync(request.LanguageId, cancellationToken);
        if (language is null)
        {
            return Result.Fail("Язык не найден", ErrorCode.NotFound);
        }

        var results = await codeRunner.RunTestsAsync(
            task,
            language,
            request.Code,
            cancellationToken);

        match.AddSolution(
            request.UserId,
            request.TaskId,
            results.All(r => r.IsSovled),
            request.Code,
            results);

        await unitOfWork.CommitAsync(cancellationToken);

        var tasks = match.TaskSlots.Count;
        var userSolves = match.SolveRecords.Count(r => r.UserId == request.UserId && r.IsCompleted);

        if (tasks == userSolves)
        {
            match.End(request.UserId);

            await unitOfWork.CommitAsync(cancellationToken);
        }

        await matchmakingNotificator.NotifyMatchUpdatedAsync(match.Player1Id, match.Player2Id, cancellationToken);

        return Result.Ok();
    }
}
