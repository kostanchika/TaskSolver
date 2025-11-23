using MitMediator;
using System.Net.Http.Json;
using System.Text.Json;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.Commands;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Application.Solutions.Handlers;

public sealed class SendSolutionHandler(
    IUnitOfWork unitOfWork,
    ISolutionNotificator solutionNotificator)
    : IRequestHandler<SendSolutionCommand, Guid>
{
    public async ValueTask<Guid> HandleAsync(SendSolutionCommand request, CancellationToken cancellationToken)
    {
        var solution = new Solution(
            request.LanguageId,
            request.UserId,
            request.TaskId,
            request.Code);

        await unitOfWork.Solutions.AddAsync(solution, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        await solutionNotificator.NotifiySolutionCompleted(request.UserId, solution.Id, cancellationToken);

        // Long-Task
        await Task.Delay(5000, cancellationToken);

        var task = await unitOfWork.ProgrammingTasks.GetByIdAsync(
            request.TaskId,
            cancellationToken);

        var language = await unitOfWork.ProgrammingLanguages.GetByIdAsync(
            request.LanguageId,
            cancellationToken);

        var tests = task!.Tests;

        List<TestResult> results = [];

        foreach (var test in tests) {

            var payload = new
            {
                request.Code,
                test.Input,
                language!.Interpretor,
                language!.FileExtension
            };

            try
            {
                using var httpClient = new HttpClient();

                var response = await httpClient.PostAsJsonAsync("http://host.docker.internal:5100/run",
                    payload,
                    cancellationToken: cancellationToken);

                var result = await response.Content.ReadAsStringAsync(cancellationToken);

                var doc = JsonDocument.Parse(result);

                string stdout = doc.RootElement.GetProperty("stdout").GetString()!;
                string stderr = doc.RootElement.GetProperty("stderr").GetString()!;

                results.Add(new TestResult(test.Input, test.IsPublic, stdout, stderr, test.Output == stdout));
            }
            catch (Exception ex)
            {
                results.Add(new TestResult(test.Input, test.IsPublic, "", ex.Message, false));
            }
        }

        solution.Complete(results);

        await unitOfWork.CommitAsync(cancellationToken);

        await solutionNotificator.NotifiySolutionCompleted(request.UserId, solution.Id, cancellationToken);

        return solution.Id;
    }
}
