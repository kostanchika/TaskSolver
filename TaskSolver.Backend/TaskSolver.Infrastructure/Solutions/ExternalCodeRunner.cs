using System.Net.Http.Json;
using System.Text.Json;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Infrastructure.Solutions;

public sealed class ExternalCodeRunner(
    IHttpClientFactory httpClientFactory)
    : ICodeRunner
{
    public async Task<IEnumerable<TestResult>> RunTestsAsync(
        ProgrammingTask task,
        ProgrammingLanguage language,
        string code,
        CancellationToken cancellationToken = default)
    {
        var tests = task.Tests;

        var testTasks = tests.Select(async test =>
        {
            var payload = new
            {
                code,
                test.Input,
                Language = language.Name,
                language!.Interpretor,
                language!.FileExtension,
                TimeoutSeconds = 30
            };

            try
            {
                var httpClient = httpClientFactory.CreateClient("coderunner");
                httpClient.Timeout = TimeSpan.FromSeconds(20);

                var response = await httpClient.PostAsJsonAsync(
                    "run",
                    payload,
                    cancellationToken: cancellationToken);

                var result = await response.Content.ReadAsStringAsync(cancellationToken);

                var doc = JsonDocument.Parse(result);

                string stdout = doc.RootElement.GetProperty("stdout").GetString()!;
                string stderr = doc.RootElement.GetProperty("stderr").GetString()!;

                return new TestResult(
                    test.Input,
                    test.IsPublic,
                    stdout,
                    stderr,
                    test.Output == stdout);
            }
            catch (Exception ex)
            {
                return new TestResult(
                    test.Input,
                    test.IsPublic,
                    "",
                    ex.Message,
                    false);
            }
        });

        var results = await Task.WhenAll(testTasks);

        return results;
    }

    public async Task<TestResult> RunTestsAsync(string code, ProgrammingLanguage language, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            code,
            Input = "NULL",
            Language = language.Name,
            language!.Interpretor,
            language!.FileExtension,
            TimeoutSeconds = 30
        };

        try
        {
            var httpClient = httpClientFactory.CreateClient("coderunner");
            httpClient.Timeout = TimeSpan.FromSeconds(20);

            var response = await httpClient.PostAsJsonAsync(
                "run",
                payload,
                cancellationToken: cancellationToken);

            var result = await response.Content.ReadAsStringAsync(cancellationToken);

            var doc = JsonDocument.Parse(result);

            string stdout = doc.RootElement.GetProperty("stdout").GetString()!;
            string stderr = doc.RootElement.GetProperty("stderr").GetString()!;

            return new TestResult("", true, stdout, stderr, true);
        }
        catch (Exception ex)
        {
            return new TestResult("", true, "", ex.Message, false);
        }
    }
}
