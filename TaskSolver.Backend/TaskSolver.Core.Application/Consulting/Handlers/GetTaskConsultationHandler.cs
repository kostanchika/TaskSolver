using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Consulting.Interfaces;
using TaskSolver.Core.Application.Consulting.Models;
using TaskSolver.Core.Application.Consulting.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Consulting.Handlers;

public sealed class GetTaskConsultationHandler(
    IUnitOfWork unitOfWork,
    ITaskConsultant taskConsultant)
    : IRequestHandler<GetTaskConsultationQuery, Result<ConsultMessage>>
{
    private static readonly Dictionary<Guid, List<string>> _context = [];

    public async ValueTask<Result<ConsultMessage>> HandleAsync(GetTaskConsultationQuery request, CancellationToken cancellationToken)
    {
        var task = await unitOfWork.ProgrammingTasks.GetByIdAsync(
            request.TaskId,
            cancellationToken);
        if (task is null)
        {
            return Result<ConsultMessage>.Fail("Задача не найдена", ErrorCode.NotFound);
        }

        if (request.Question is null) _context[request.UserId] = [];

        var answer = request.Question is null
            ? await taskConsultant.GetTaskDescriptionAsync(task, cancellationToken)
            : await taskConsultant.AnswerQuestionAsync(
                task,
                request.Question,
                _context[request.UserId],
                cancellationToken);

        _context.TryAdd(request.UserId, []);

        _context[request.UserId].Add(request.Question ?? "Опиши задачу");
        _context[request.UserId].Add(answer);

        var message = new ConsultMessage(
            request.TaskId,
            answer);

        return Result.Ok(message);
    }
}
