namespace TaskSolver.Api.Controllers.Constructor.Requests;

public record RunCodeRequest(string Code, Guid LanguageId);