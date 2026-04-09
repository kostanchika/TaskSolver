using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using TaskSolver.Api.Controllers.Constructor.Requests;
using TaskSolver.Api.Controllers.Constructor.Responses;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Constructor;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Api.Controllers.Constructor;

// DTOs.cs
public class CreateChatRequest
{
    public string Theme { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
}

public class GenerateTaskRequest
{
    public string Theme { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public Guid? ChatId { get; set; }
}

public class ValidateStepRequest
{
    public string Code { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
    public int StepNumber { get; set; }
    public Guid ChatId { get; set; }
}

public class RunCodeRequest
{
    public string Code { get; set; } = string.Empty;
    public Guid LanguageId { get; set; }
    public Guid ChatId { get; set; }
    public int? StepNumber { get; set; }
}

public class ChatResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public int LastCompletedStep { get; set; }
    public int TotalSteps { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsArchived { get; set; }
}

public class ChatDetailResponse
{
    public ChatResponse Chat { get; set; } = null!;
    public GeneratedTask Task { get; set; } = null!;
    public List<ChatMessage> Messages { get; set; } = new();
}

public class ValidateStepResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public List<string> Suggestions { get; set; } = new();
    public bool IsStepCompleted { get; set; }
    public bool IsTaskCompleted { get; set; }
    public int CurrentStep { get; set; }
    public int TotalSteps { get; set; }
    public string? NextStepDescription { get; set; }
    public StepFeedback? StepFeedback { get; set; }
}

[Route("api/constructor")]
[ApiController]
[Authorize]
public sealed class ConstructorController : ControllerBase
{
    private readonly ICodeRunner _codeRunner;
    private readonly IUnitOfWork _unitOfWork;
    private readonly HttpClient _mistral;
    private readonly ILogger<ConstructorController> _logger;

    private static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ConstructorController(
        ICodeRunner codeRunner,
        IUnitOfWork unitOfWork,
        IHttpClientFactory factory,
        ILogger<ConstructorController> logger)
    {
        _codeRunner = codeRunner;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mistral = factory.CreateClient("mistral");
        _mistral.Timeout = TimeSpan.FromMinutes(3);
    }

    // ============== ЧАТЫ ==============

    [HttpGet("chats")]
    public async Task<ActionResult<List<ChatResponse>>> GetUserChats()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chats = (await _unitOfWork.TaskChats
            .GetAllAsync())
            .Where(c => c.UserId == userId && !c.IsArchived)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new ChatResponse
            {
                Id = c.Id,
                Title = c.Title,
                Theme = c.Theme,
                Difficulty = c.Difficulty,
                LastCompletedStep = c.LastCompletedStep,
                TotalSteps = 0, // Заполним позже из TaskData
                UpdatedAt = c.UpdatedAt,
                IsArchived = c.IsArchived
            })
            .ToList();

        // Заполняем TotalSteps из JSON
        foreach (var chat in chats)
        {
            var taskChat = await _unitOfWork.TaskChats.GetByIdAsync(chat.Id);
            if (!string.IsNullOrEmpty(taskChat?.TaskData))
            {
                var task = JsonSerializer.Deserialize<GeneratedTask>(taskChat.TaskData, _options);
                chat.TotalSteps = task?.Steps.Count ?? 0;
            }
        }

        return Ok(chats);
    }

    [HttpGet("chats/{chatId}")]
    public async Task<ActionResult<ChatDetailResponse>> GetChat(Guid chatId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chat = (await _unitOfWork.TaskChats
            .GetAllAsync())
            .FirstOrDefault(c => c.Id == chatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Чат не найден");

        var messages = chat.Messages
            .OrderBy(m => m.CreatedAt)
            .ToList();

        var task = JsonSerializer.Deserialize<GeneratedTask>(chat.TaskData, _options)!;

        task.StepFeedbacks = messages
            .Where(m => m.Role == "assistant" && m.StepNumber.HasValue && m.Feedback != null)
            .OrderByDescending(m => m.CreatedAt)
            .DistinctBy(m => m.StepNumber!.Value)
            .ToDictionary(
                m => m.StepNumber!.Value,
                m => JsonSerializer.Deserialize<StepFeedback>(m.Feedback!, _options)!
            );

        return Ok(new ChatDetailResponse
        {
            Chat = new ChatResponse
            {
                Id = chat.Id,
                Title = chat.Title,
                Theme = chat.Theme,
                Difficulty = chat.Difficulty,
                LastCompletedStep = chat.LastCompletedStep,
                TotalSteps = task.Steps.Count,
                UpdatedAt = chat.UpdatedAt,
                IsArchived = chat.IsArchived
            },
            Task = task,
            Messages = messages
        });
    }

    [HttpPost("chats")]
    public async Task<ActionResult<Guid>> CreateChat([FromBody] CreateChatRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chat = new TaskChat(
            userId,
            $"Задача на тему '{request.Theme}'",
            request.Theme,
            request.Difficulty);

        await _unitOfWork.TaskChats.AddAsync(chat);
        await _unitOfWork.CommitAsync();

        return Ok(chat.Id);
    }

    [HttpDelete("chats/{chatId}")]
    public async Task<IActionResult> DeleteChat(Guid chatId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chat = (await _unitOfWork.TaskChats.GetAllAsync())
            .FirstOrDefault(c => c.Id == chatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Чат не найден");

        await _unitOfWork.TaskChats.DeleteAsync(chat);
        await _unitOfWork.CommitAsync();

        return NoContent();
    }

    [HttpPatch("chats/{chatId}/archive")]
    public async Task<IActionResult> ArchiveChat(Guid chatId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chat = (await _unitOfWork.TaskChats.GetAllAsync())
            .FirstOrDefault(c => c.Id == chatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Чат не найден");

        chat.IsArchived = true;
        await _unitOfWork.CommitAsync();

        return NoContent();
    }

    // ============== ГЕНЕРАЦИЯ ЗАДАЧИ ==============

    [HttpPost("generate")]
    public async Task<ActionResult<GeneratedTask>> GenerateTaskAsync(
        [FromBody] GenerateTaskRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Сохраняем сообщение пользователя
        if (request.ChatId.HasValue)
        {
            var chat = (await _unitOfWork.TaskChats.GetAllAsync())
                        .FirstOrDefault(c => c.Id == request.ChatId.Value && c.UserId == userId);


            var userMessage = new ChatMessage(
                "user",
                $"Создать задачу на тему '{request.Theme}' со сложностью '{request.Difficulty}'",
                null,
                null,
                null,
                null,
                null);
            
            chat.Messages.Add(userMessage);
        }

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

        // Сохраняем в БД если есть chatId
        if (request.ChatId.HasValue)
        {
            var chat = (await _unitOfWork.TaskChats.GetAllAsync())
                        .FirstOrDefault(c => c.Id == request.ChatId.Value && c.UserId == userId);

            if (chat != null)
            {
                chat.Title = task.Title;
                chat.TaskData = JsonSerializer.Serialize(task, _options);
                chat.UpdatedAt = DateTime.UtcNow;

                // Сохраняем ответ ассистента
                var assistantMessage = new ChatMessage(
                    "assistant",
                    $"Сгенерирована задача: {task.Title}\n\n{task.Description}",
                    null,
                    null,
                    null,
                    null,
                    null);

                chat.Messages.Add(assistantMessage);

                await _unitOfWork.CommitAsync();
            }
        }

        return Ok(task);
    }

    // ============== ВАЛИДАЦИЯ ШАГА ==============

    [HttpPost("validate-step")]
    public async Task<ActionResult<ValidateStepResponse>> ValidateStep(
        [FromBody] ValidateStepRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var chat = (await _unitOfWork.TaskChats.GetAllAsync())
                        .FirstOrDefault(c => c.Id == request.ChatId && c.UserId == userId);

        if (chat == null)
        {
            return NotFound("Чат не найден");
        }

        var task = JsonSerializer.Deserialize<GeneratedTask>(chat.TaskData, _options)!;

        var currentStep = task.Steps.FirstOrDefault(s => s.Order == request.StepNumber);
        if (currentStep == null)
        {
            return BadRequest("Шаг не найден");
        }

        if (request.StepNumber <= chat.LastCompletedStep)
        {
            return Conflict("Этот шаг уже выполнен");
        }

        var language = await _unitOfWork.ProgrammingLanguages.GetByIdAsync(
            Guid.Parse(request.LanguageCode));
        if (language == null)
        {
            return NotFound("Язык не найден");
        }

        // Сохраняем код пользователя
        var userMessage = new ChatMessage(
            "user",
            $"Решение шага {request.StepNumber}: {currentStep.Title}",
            request.Code,
            $"{language.Name} {language.Version}",
            request.StepNumber,
            null,
            null);

        chat.Messages.Add(userMessage);

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

        Проверь решение для этого шага. Шаг считается выполненным, если код корректно реализует требуемую функциональность.";

        var validateResponse = await SendRequestAsync<ValidateStepResponse>(systemPrompt, userPrompt);

        if (validateResponse != null)
        {
            validateResponse.TotalSteps = task.Steps.Count;
            validateResponse.CurrentStep = request.StepNumber;

            bool isStepCompleted = validateResponse.IsValid && validateResponse.IsStepCompleted;

            if (isStepCompleted && request.StepNumber == chat.LastCompletedStep + 1)
            {
                chat.LastCompletedStep = request.StepNumber;
                chat.UpdatedAt = DateTime.UtcNow;
                currentStep.IsCompleted = true;

                // Обновляем TaskData
                chat.TaskData = JsonSerializer.Serialize(task, _options);

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
            }

            var stepFeedback = new StepFeedback
            {
                IsValid = validateResponse.IsValid,
                Message = validateResponse.Message,
                Hint = validateResponse.Hint ?? "",
                Suggestions = validateResponse.Suggestions,
                ValidatedAt = DateTime.UtcNow
            };

            validateResponse.StepFeedback = stepFeedback;

            // Сохраняем ответ ассистента
            var assistantMessage = new ChatMessage(
                "assistant",
                validateResponse.Message,
                request.Code,
                $"{language.Name} {language.Version}",
                request.StepNumber,
                validateResponse.IsValid,
                JsonSerializer.Serialize(stepFeedback, _options));
            
            chat.Messages.Add(assistantMessage);
        }

        await _unitOfWork.CommitAsync();

        return Ok(validateResponse ?? new ValidateStepResponse
        {
            IsValid = false,
            Message = "Не удалось проверить решение. Попробуйте еще раз.",
            Suggestions = new List<string> { "Убедитесь, что код компилируется", "Проверьте синтаксис" },
            IsStepCompleted = false,
            CurrentStep = request.StepNumber,
            TotalSteps = task.Steps.Count
        });
    }

    // ============== ВЫПОЛНЕНИЕ КОДА ==============

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

        // Сохраняем результат выполнения в сообщение, если указан чат
        if (request.ChatId != Guid.Empty && request.StepNumber.HasValue)
        {
            var executionMessage = new ChatMessage(
                "system",
                $"stderr: {result.Stderr}\nstdout: {result.Stdout}",
                request.Code,
                $"{language.Name} {language.Version}",
                request.StepNumber,
                null,
                null);

            var chat = (await _unitOfWork.TaskChats.GetAllAsync())
                        .FirstOrDefault(c => c.Id == request.ChatId);


            chat.Messages.Add(executionMessage);
            await _unitOfWork.CommitAsync();
        }

        return Ok(result);
    }

    // ============== ХЕЛПЕРЫ ==============

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