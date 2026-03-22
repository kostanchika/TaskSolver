using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Application.Common;
using Microsoft.AspNetCore.Authorization;
using TaskSolver.Api.Controllers.Constructor.Responses;
using TaskSolver.Api.Controllers.Constructor.Requests;

namespace TaskSolver.Api.Controllers.Constructor;

[Route("api/constructor")]
[ApiController]
[Authorize]
public sealed class ConstructorController : ControllerBase
{
    private readonly ICodeRunner _codeRunner;
    private readonly IUnitOfWork _unitOfWork;
    private readonly HttpClient _mistral;

    private static readonly Dictionary<Guid, GeneratedTask> _sessions = [];
    private static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ConstructorController(
        ICodeRunner codeRunner,
        IUnitOfWork unitOfWork,
        IHttpClientFactory factory)
    {
        _codeRunner = codeRunner;
        _unitOfWork = unitOfWork;
        _mistral = factory.CreateClient("mistral");
        _mistral.Timeout = TimeSpan.FromMinutes(3);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<GeneratedTask>> GenerateTaskAsync(
        [FromBody] GenerateTaskRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var systemPrompt = @"Ты - экспертный ИИ-конструктор задач по программированию. 
        Твоя задача - создавать структурированные задачи с пошаговым решением для обучения программированию.

        ВАЖНЫЕ ПРАВИЛА:
        1. Задача должна быть разбита на 4-8 логических шагов (в зависимости от сложности и темы)
        2. Каждый шаг должен иметь четкое описание и подсказку
        3. Шаги должны идти от простого к сложному
        4. Задача должна быть практической и решаемой
        5. Пользователь может присылать решение на любом языке программирования
        6. Для каждого шага ОБЯЗАТЕЛЬНО укажи корректный тип (используй числовые значения):
           0 - DataGeneration (генерация/подготовка данных)
           1 - Validation (валидация входных данных)
           2 - Processing (основная обработка)
           3 - Optimization (оптимизация решения)
           4 - Testing (написание тестов)
           5 - Documentation (документирование кода)
        7. Задача НЕ ДОЛЖНА предполагать использование фреймворков

        ФОРМАТ ОТВЕТА (строго JSON, без markdown и пояснений):
        {
            ""title"": ""Название задачи"",
            ""description"": ""Общее описание задачи"",
            ""steps"": [
                {
                    ""order"": 1,
                    ""title"": ""Название шага"",
                    ""description"": ""Подробное описание что нужно сделать"",
                    ""hint"": ""Подсказка для этого шага (без привязки к ЯП)"",
                    ""type"": 0
                }
            ]
        }";

        var userPrompt = $"Создай задачу по программированию на тему '{request.Theme}' со сложностью '{request.Difficulty}'. " +
                        "Задача должна быть практической и подходить для пошагового решения.";

        var task = await SendRequestAsync<GeneratedTask>(systemPrompt, userPrompt);
        int retryCount = 0;
        while (task == null && retryCount < 3)
        {
            await Task.Delay(5000);
            task = await SendRequestAsync<GeneratedTask>(systemPrompt, userPrompt);
            retryCount++;
        }

        if (task == null)
        {
            return BadRequest("Не удалось сгенерировать задачу");
        }

        task.Theme = request.Theme;
        task.Difficulty = request.Difficulty;
        task.LastCompletedStep = 0;
        task.StepFeedbacks = new Dictionary<int, StepFeedback>();

        foreach (var step in task.Steps)
        {
            if ((int)step.Type < 0 || (int)step.Type > 5)
            {
                step.Type = StepType.Processing;
            }
        }

        _sessions[userId] = task;

        return task;
    }

    [HttpGet("current")]
    public ActionResult<GeneratedTask> GetCurrentTask()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!_sessions.TryGetValue(userId, out var task))
        {
            return NotFound("Нет активной задачи");
        }

        for (int i = 0; i < task.Steps.Count; i++)
        {
            task.Steps[i].IsCompleted = i + 1 <= task.LastCompletedStep;
        }

        return Ok(task);
    }

    [HttpDelete("current")]
    public IActionResult DeleteCurrentTask()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!_sessions.Remove(userId))
        {
            return NotFound("Нет активной задачи");
        }

        return NoContent();
    }

    [HttpPost("validate-step")]
    public async Task<ActionResult<ValidateStepResponse>> ValidateStep(
        [FromBody] ValidateStepRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!_sessions.TryGetValue(userId, out var task))
        {
            return NotFound("Задача не найдена");
        }

        var currentStep = task.Steps.FirstOrDefault(s => s.Order == request.StepNumber);
        if (currentStep == null)
        {
            return BadRequest("Шаг не найден");
        }

        if (request.StepNumber <= task.LastCompletedStep)
        {
            return Conflict("Этот шаг уже выполнен");
        }

        var language = await _unitOfWork.ProgrammingLanguages.GetByIdAsync(
            Guid.Parse(request.LanguageCode));
        if (language == null)
        {
            return NotFound("Язык не найден");
        }

        var systemPrompt = @"Ты - ИИ-наставник по программированию. Твоя задача - проверять решения пользователя по шагам и давать конструктивную обратную связь.

        Оценивай код по критериям:
        1. Корректность решения для текущего шага
        2. Соответствие условиям шага
        3. Качество кода (читаемость, эффективность)
        4. Потенциальные проблемы

        ФОРМАТ ОТВЕТА (строго JSON, без markdown):
        {
            ""isValid"": true/false,
            ""message"": ""Подробный анализ решения"",
            ""hint"": ""Если решение неверное - конкретная подсказка"",
            ""suggestions"": [""Список предложений по улучшению""],
            ""isStepCompleted"": true/false
        }";

        var userPrompt = $@"Задача: {task.Title}
        Текущий шаг {request.StepNumber}: {currentStep.Title}
        Описание шага: {currentStep.Description}
        Подсказка: {currentStep.Hint}

        Код пользователя на {language.Name}:
        {request.Code}

        text

        Проверь решение для этого шага. Шаг считается выполненным, если код корректно реализует требуемую функциональность.";

        var validateResponse = await SendRequestAsync<ValidateStepResponse>(systemPrompt, userPrompt);

        if (validateResponse != null)
        {
            validateResponse.TotalSteps = task.Steps.Count;
            validateResponse.CurrentStep = request.StepNumber;

            bool isStepCompleted = validateResponse.IsValid && validateResponse.IsStepCompleted;

            if (isStepCompleted && request.StepNumber == task.LastCompletedStep + 1)
            {
                task.LastCompletedStep = request.StepNumber;
                currentStep.IsCompleted = true;

                task.StepFeedbacks[request.StepNumber] = new StepFeedback
                {
                    IsValid = true,
                    Message = validateResponse.Message,
                    Hint = validateResponse.Hint,
                    Suggestions = validateResponse.Suggestions,
                    ValidatedAt = DateTime.UtcNow
                };

                validateResponse.IsStepCompleted = true;

                if (request.StepNumber < task.Steps.Count)
                {
                    var nextStep = task.Steps.FirstOrDefault(s => s.Order == request.StepNumber + 1);
                    validateResponse.NextStepDescription = nextStep?.Description ?? "";
                }

                if (request.StepNumber == task.Steps.Count)
                {
                    validateResponse.IsTaskCompleted = true;
                }
            }
            else
            {
                validateResponse.IsStepCompleted = false;

                task.StepFeedbacks[request.StepNumber] = new StepFeedback
                {
                    IsValid = validateResponse.IsValid,
                    Message = validateResponse.Message,
                    Hint = validateResponse.Hint,
                    Suggestions = validateResponse.Suggestions,
                    ValidatedAt = DateTime.UtcNow
                };
            }

            validateResponse.StepFeedback = task.StepFeedbacks[request.StepNumber];
        }

        return Ok(validateResponse ?? new ValidateStepResponse
        {
            IsValid = false,
            Message = "Не удалось проверить решение. Попробуйте еще раз.",
            Suggestions = ["Убедитесь, что код компилируется", "Проверьте синтаксис"],
            IsStepCompleted = false
        });
    }

    [HttpPost("run")]
    public async Task<ActionResult<TestResult>> RunCode(
        [FromBody] RunCodeRequest request)
    {
        var language = await _unitOfWork.ProgrammingLanguages.GetByIdAsync(request.LanguageId);
        if (language == null)
        {
            return NotFound("Язык программирования не найден");
        }

        var result = await _codeRunner.RunTestsAsync(request.Code, language);

        return result;
    }

    private async Task<string> SendRequestAsync(string systemPrompt, string userPrompt)
    {
        var request = new
        {
            model = "mistral-large-latest",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.7
        };

        var response = await _mistral.PostAsJsonAsync("v1/chat/completions", request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var content = json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()!;

        return content;
    }

    private async Task<T> SendRequestAsync<T>(string systemPrompt, string userPrompt)
    {
        var content = await SendRequestAsync(systemPrompt, userPrompt);
        var jsonContent = ExtractJsonFromResponse(content);
     
        return JsonSerializer.Deserialize<T>(jsonContent, _options)!;
    }

    private static string ExtractJsonFromResponse(string response)
    {
        int startIndex = response.IndexOf('{');
        int endIndex = response.LastIndexOf('}');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
        {
            var jsonPart = response.Substring(startIndex, endIndex - startIndex + 1);

            try
            {
                JsonDocument.Parse(jsonPart);
                return jsonPart;
            }
            catch (Exception)
            {
                var codeBlockStart = response.IndexOf("```json");
                if (codeBlockStart != -1)
                {
                    codeBlockStart += 7;
                    var codeBlockEnd = response.IndexOf("```", codeBlockStart);
                    if (codeBlockEnd != -1)
                    {
                        jsonPart = response.Substring(codeBlockStart, codeBlockEnd - codeBlockStart).Trim();
                        JsonDocument.Parse(jsonPart);
                        return jsonPart;
                    }
                }
                throw;
            }
        }

        throw new InvalidOperationException($"Не удалось извлечь валидный JSON из ответа: {response}");
    }
}