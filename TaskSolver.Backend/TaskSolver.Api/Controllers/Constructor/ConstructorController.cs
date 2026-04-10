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
    /// <summary>Текст, который будет передан в stdin процесса</summary>
    public string? Stdin { get; set; }
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

public sealed class ChatMessageDto
{
    public string Id { get; set; } = string.Empty;
    public string ChatId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? Language { get; set; }
    public int? StepNumber { get; set; }
    public bool? IsValid { get; set; }
    public string? Feedback { get; set; }
    public string? MessageKind { get; set; }
    public string? ProgramStdin { get; set; }
    public string? ProgramStdout { get; set; }
    public string? ProgramStderr { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ChatDetailResponse
{
    public ChatResponse Chat { get; set; } = null!;
    public GeneratedTask? Task { get; set; }
    public List<ChatMessageDto> Messages { get; set; } = new();
}

public sealed class SendChatMessageRequest
{
    public string Content { get; set; } = string.Empty;
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

        return Ok(BuildChatDetailResponse(chat));
    }

    [HttpPost("chats/{chatId}/messages")]
    public async Task<ActionResult<ChatDetailResponse>> SendChatMessage(
        Guid chatId,
        [FromBody] SendChatMessageRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var text = request.Content?.Trim();
        if (string.IsNullOrEmpty(text))
            return BadRequest("Введите текст сообщения");

        var chat = (await _unitOfWork.TaskChats.GetAllAsync())
            .FirstOrDefault(c => c.Id == chatId && c.UserId == userId);

        if (chat == null)
            return NotFound("Чат не найден");

        chat.Messages.Add(new ChatMessage(
            "user",
            text,
            null,
            null,
            null,
            null,
            null,
            "user_chat"));
        chat.UpdatedAt = DateTime.UtcNow;

        GeneratedTask? task = null;
        if (!string.IsNullOrWhiteSpace(chat.TaskData))
            task = JsonSerializer.Deserialize<GeneratedTask>(chat.TaskData, _options);

        var taskSummary = task == null
            ? "Сгенерированная задача ещё не создана — опирайся на тему и сложность сессии."
            : $"Текущая задача: «{task.Title}». Кратко: {task.Description}\nШаги (дорожная карта, не экзамен):\n" +
              string.Join("\n", task.Steps.OrderBy(s => s.Order).Select(s => $"{s.Order}. {s.Title}: {s.Description}"));

        var systemPrompt =
            "Ты дружелюбный наставник по программированию. Пользователь ведёт сессию в режиме чата: он может задавать вопросы, просить объяснить тему или код, экспериментировать.\n" +
            "Не дави и не требуй проходить шаги. Оценку «верно/неверно» по коду пользователь получает только через отдельную кнопку «Проверить шаг» — в этом чате помогай, объясняй, предлагай идеи.\n" +
            "Отвечай по-русски. Можно markdown и короткие блоки кода.\n\n" +
            $"Тема: {chat.Theme}. Сложность: {chat.Difficulty}.\n\n{taskSummary}";

        var mistralMessages = BuildMistralChatMessages(chat, systemPrompt);
        string reply;
        try
        {
            reply = await SendChatCompletionMultiTurnAsync(mistralMessages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Constructor chat Mistral failed");
            reply = "Не удалось получить ответ от модели. Попробуйте ещё раз через минуту.";
        }

        chat.Messages.Add(new ChatMessage(
            "assistant",
            reply.Trim(),
            null,
            null,
            null,
            null,
            null,
            "assistant_chat"));
        chat.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CommitAsync();

        return Ok(BuildChatDetailResponse(chat));
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

            if (chat != null)
            {
                chat.Messages.Add(new ChatMessage(
                    "user",
                    $"Создать задачу на тему '{request.Theme}' со сложностью '{request.Difficulty}'",
                    null,
                    null,
                    null,
                    null,
                    null,
                    "user_request_task"));
                chat.UpdatedAt = DateTime.UtcNow;
            }
        }

        var systemPrompt = @"Ты — ИИ-наставник по программированию. Пользователь указал тему и сложность; ты предлагаешь практическую задачу и дорожную карту из шагов.

        КОНТЕКСТ РЕЖИМА:
        - Шаги — это рекомендуемый порядок работы, а не экзамен. Пользователь может свободно обсуждать тему в чате, задавать вопросы и не обязан сразу «сдавать» решения.
        - Оценка «верно/неверно» выполняется только когда пользователь сам нажимает «Проверить шаг» в интерфейсе; в обычном чате ты помогаешь и объясняешь, без давления.

        ПРАВИЛА ЗАДАЧИ:
        1. 4–8 логических шагов (по сложности темы)
        2. У каждого шага — понятное описание и подсказка
        3. От простого к сложному
        4. Практическая, решаемая задача; любой язык программирования
        5. Тип шага (число): 0 DataGeneration, 1 Validation, 2 Processing, 3 Optimization, 4 Testing, 5 Documentation
        6. Без обязательных фреймворков

        ФОРМАТ ОТВЕТА (строго JSON, без markdown):
        {
            ""title"": ""Название задачи"",
            ""description"": ""Общее описание задачи"",
            ""steps"": [
                {
                    ""order"": 1,
                    ""title"": ""Название шага"",
                    ""description"": ""Подробное описание что нужно сделать"",
                    ""hint"": ""Подсказка (без привязки к ЯП)"",
                    ""type"": 0
                }
            ]
        }";

        var userPrompt = $"Создай задачу по программированию на тему '{request.Theme}' со сложностью '{request.Difficulty}'. " +
                        "Сформулируй описание дружелюбно: это материал для практики и чата с наставником, а не жёсткий контрольный.";

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
                    $"Я подготовил для тебя задачу «{task.Title}». Это ориентир для практики — можешь идти по шагам или сначала пообщаться в чате и разобрать тему.\n\n{task.Description}",
                    null,
                    null,
                    null,
                    null,
                    null,
                    "task_generated");

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
            null,
            "user_step_code");

        chat.Messages.Add(userMessage);

        var systemPrompt = @"Ты — ИИ-наставник. Пользователь явно запросил проверку шага (кнопка в интерфейсе). Дай конструктивную обратную связь: поддерживающий тон, без уничижения.

        Критерии:
        1. Соответствие текущему шагу и его описанию
        2. Корректность идеи и кода
        3. Читаемость и аккуратность
        4. Замечания по возможным ошибкам

        ФОРМАТ ОТВЕТА (строго JSON, без markdown):
        {
            ""isValid"": true/false,
            ""message"": ""Разбор и рекомендации"",
            ""hint"": ""Если нужно доработать — конкретная подсказка"",
            ""suggestions"": [""Идеи по улучшению""],
            ""isStepCompleted"": true/false
        }";

        var userPrompt = $@"Задача: {task.Title}
        Текущий шаг {request.StepNumber}: {currentStep.Title}
        Описание шага: {currentStep.Description}
        Подсказка: {currentStep.Hint}

        Код пользователя на {language.Name}:
        {request.Code}

        Проверь решение для этого шага. Шаг считается выполненным (isStepCompleted), только если код по сути закрывает цель шага; при частичном решении isValid может быть true, но isStepCompleted — false.";

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
                IsValid = isStepCompleted,
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
                isStepCompleted,
                JsonSerializer.Serialize(stepFeedback, _options),
                "step_validation");
            
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
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var language = await _unitOfWork.ProgrammingLanguages.GetByIdAsync(request.LanguageId);
        if (language == null)
        {
            return NotFound("Язык программирования не найден");
        }

        var result = await _codeRunner.RunTestsAsync(
            request.Code,
            language,
            request.Stdin);

        if (request.ChatId != Guid.Empty)
        {
            var chat = (await _unitOfWork.TaskChats.GetAllAsync())
                .FirstOrDefault(c => c.Id == request.ChatId && c.UserId == userId);

            if (chat != null)
            {
                var stepLabel = request.StepNumber.HasValue
                    ? $"шаг {request.StepNumber}"
                    : "без привязки к шагу";
                var executionMessage = new ChatMessage(
                    "system",
                    $"Запуск кода ({language.Name}, {stepLabel})",
                    request.Code,
                    $"{language.Name} {language.Version}",
                    request.StepNumber,
                    null,
                    null,
                    "code_run")
                {
                    ProgramStdin = request.Stdin,
                    ProgramStdout = result.Stdout,
                    ProgramStderr = result.Stderr
                };

                chat.Messages.Add(executionMessage);
                chat.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.CommitAsync();
            }
        }

        return Ok(result);
    }

    private ChatDetailResponse BuildChatDetailResponse(TaskChat chat)
    {
        var messagesOrdered = chat.Messages.OrderBy(m => m.CreatedAt).ToList();
        GeneratedTask? task = null;
        if (!string.IsNullOrWhiteSpace(chat.TaskData))
        {
            task = JsonSerializer.Deserialize<GeneratedTask>(chat.TaskData, _options);
            if (task != null)
            {
                task.StepFeedbacks = messagesOrdered
                    .Where(m => m.Role == "assistant" && m.StepNumber.HasValue && m.Feedback != null)
                    .OrderByDescending(m => m.CreatedAt)
                    .DistinctBy(m => m.StepNumber!.Value)
                    .ToDictionary(
                        m => m.StepNumber!.Value,
                        m => JsonSerializer.Deserialize<StepFeedback>(m.Feedback!, _options)!);
            }
        }

        return new ChatDetailResponse
        {
            Chat = new ChatResponse
            {
                Id = chat.Id,
                Title = chat.Title,
                Theme = chat.Theme,
                Difficulty = chat.Difficulty,
                LastCompletedStep = chat.LastCompletedStep,
                TotalSteps = task?.Steps.Count ?? 0,
                UpdatedAt = chat.UpdatedAt,
                IsArchived = chat.IsArchived
            },
            Task = task,
            Messages = MapMessages(chat)
        };
    }

    private static List<ChatMessageDto> MapMessages(TaskChat chat)
    {
        var ordered = chat.Messages.OrderBy(m => m.CreatedAt).ToList();
        return ordered.Select((m, i) => MapMessageDto(m, i, chat.Id)).ToList();
    }

    private static ChatMessageDto MapMessageDto(ChatMessage m, int index, Guid chatId) => new()
    {
        Id = $"{chatId:N}_{index}",
        ChatId = chatId.ToString(),
        Role = m.Role,
        Content = m.Content,
        Code = m.Code,
        Language = m.Language,
        StepNumber = m.StepNumber,
        IsValid = m.IsValid,
        Feedback = m.Feedback,
        MessageKind = m.MessageKind,
        ProgramStdin = m.ProgramStdin,
        ProgramStdout = m.ProgramStdout,
        ProgramStderr = m.ProgramStderr,
        CreatedAt = m.CreatedAt
    };

    private static List<object> BuildMistralChatMessages(TaskChat chat, string systemPrompt)
    {
        var list = new List<object>
        {
            new Dictionary<string, string>
            {
                ["role"] = "system",
                ["content"] = systemPrompt
            }
        };

        foreach (var m in chat.Messages.OrderBy(x => x.CreatedAt).TakeLast(24))
        {
            if (m.MessageKind == "code_run")
            {
                list.Add(new Dictionary<string, string>
                {
                    ["role"] = "user",
                    ["content"] = TruncateForLlm(FormatCodeRunForLlm(m), 12_000)
                });
                continue;
            }

            if (m.Role == "user")
            {
                list.Add(new Dictionary<string, string>
                {
                    ["role"] = "user",
                    ["content"] = TruncateForLlm(FormatUserMessageForChatHistory(m), 10_000)
                });
                continue;
            }

            if (m.Role == "assistant")
            {
                list.Add(new Dictionary<string, string>
                {
                    ["role"] = "assistant",
                    ["content"] = TruncateForLlm(m.Content, 12_000)
                });
            }
        }

        return list;
    }

    private static string FormatUserMessageForChatHistory(ChatMessage m)
    {
        if (m.MessageKind == "user_step_code" && !string.IsNullOrEmpty(m.Code))
            return $"{m.Content}\n\n--- код ---\n{m.Code}";
        return m.Content;
    }

    private static string FormatCodeRunForLlm(ChatMessage m)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("[Запуск кода]");
        if (!string.IsNullOrEmpty(m.Code))
            sb.AppendLine("Код:\n" + m.Code);
        if (!string.IsNullOrEmpty(m.ProgramStdin))
            sb.AppendLine("Ввод (stdin):\n" + m.ProgramStdin);
        if (m.ProgramStdout != null || m.ProgramStderr != null)
        {
            sb.AppendLine("stdout:\n" + (m.ProgramStdout ?? ""));
            sb.AppendLine("stderr:\n" + (m.ProgramStderr ?? ""));
        }
        else
            sb.AppendLine(m.Content);

        return sb.ToString();
    }

    private static string TruncateForLlm(string s, int maxLen)
    {
        if (string.IsNullOrEmpty(s) || s.Length <= maxLen)
            return s;
        return s[..maxLen] + "\n… (обрезано)";
    }

    private async Task<string> SendChatCompletionMultiTurnAsync(IReadOnlyList<object> messagesPayload)
    {
        var request = new
        {
            model = "mistral-large-latest",
            messages = messagesPayload,
            temperature = 0.75
        };

        var response = await _mistral.PostAsJsonAsync("v1/chat/completions", request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()!;
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