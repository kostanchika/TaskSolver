namespace TaskSolver.Api.Controllers.Marks.Responses;

public sealed record MarksStatisticsResponse(
    int MarksSum,
    int TotalCount,
    int? UserMark
);