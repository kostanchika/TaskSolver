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
        List<TestResult> results = [];

        var tests = task.Tests;

        foreach (var test in tests)
        {

            var payload = new
            {
                code,
                test.Input,
                language!.Interpretor,
                language!.FileExtension
            };

            try
            {
                var httpClient = httpClientFactory.CreateClient("coderunner");
                httpClient.Timeout = TimeSpan.FromSeconds(10);

                var response = await httpClient.PostAsJsonAsync(
                    "run",
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

        return results;
    }

    public async Task<TestResult> RunTestsAsync(string code, ProgrammingLanguage language, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            code,
            Input = "",
            language!.Interpretor,
            language!.FileExtension
        };

        try
        {
            var httpClient = httpClientFactory.CreateClient("coderunner");
            httpClient.Timeout = TimeSpan.FromSeconds(10);

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
