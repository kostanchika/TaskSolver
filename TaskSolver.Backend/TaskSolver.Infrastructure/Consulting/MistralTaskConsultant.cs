using System.Net.Http.Json;
using System.Text.Json;
using TaskSolver.Core.Application.Consulting.Interfaces;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Infrastructure.Consulting;

public sealed class MistralTaskConsultant(IHttpClientFactory factory) : ITaskConsultant
{
    private readonly HttpClient httpClient = factory.CreateClient("mistral");
    private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    private static string BuildAnswerPrompt(ProgrammingTask task, string question, IEnumerable<string> context)
    {
        var taskJson = JsonSerializer.Serialize(task, _jsonOptions);

        return $"""
        ### Задача
        {taskJson}

        ### Диалог (последние шаги)
        {string.Join("\n", context.TakeLast(3))}

        ### Вопрос
        {question}
        """;
    }

    private static string BuildDescriptionPrompt(ProgrammingTask task)
    {
        var taskJson = JsonSerializer.Serialize(task, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        return $"""
        ### Задача
        {taskJson}

        ### Инструкция
        Опиши задачу пользователю, поприветствуй его, не давай решение — он попробует сам.
        """;
    }

    public async Task<string> AnswerQuestionAsync(
        ProgrammingTask task,
        string question,
        IEnumerable<string> context,
        CancellationToken cancellationToken = default)
    {
        var prompt = BuildAnswerPrompt(task, question, context);

        var request = new
        {
            model = "mistral-medium",
            messages = new[]
            {
                new { role = "system", content = "Ты — ментор по программированию. Отвечай на вопросы, но не давай готовое решение." },
                new { role = "user", content = prompt }
            }
        };

        var response = await httpClient.PostAsJsonAsync("v1/chat/completions", request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
    }

    public async Task<string> GetTaskDescriptionAsync(ProgrammingTask task, CancellationToken cancellationToken = default)
    {
        var prompt = BuildDescriptionPrompt(task);

        var request = new
        {
            model = "mistral-small",
            messages = new[]
            {
                new { role = "system", content = "Ты — ментор по программированию. Помогай человеку понять задачу, но не давай решение." },
                new { role = "user", content = prompt }
            }
        };

        var response = await httpClient.PostAsJsonAsync("v1/chat/completions", request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
    }
}