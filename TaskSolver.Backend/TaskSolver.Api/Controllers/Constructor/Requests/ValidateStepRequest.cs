namespace TaskSolver.Api.Controllers.Constructor.Requests;

public record ValidateStepRequest(string Code, string LanguageCode, int StepNumber);