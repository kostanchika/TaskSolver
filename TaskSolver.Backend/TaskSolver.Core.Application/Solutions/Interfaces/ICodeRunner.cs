using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Core.Application.Solutions.Interfaces;

public interface ICodeRunner
{
    Task<TestResult> RunTestsAsync(
        string code,
        ProgrammingLanguage language,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<TestResult>> RunTestsAsync(
        ProgrammingTask task,
        ProgrammingLanguage language,
        string code,
        CancellationToken cancellationToken = default);
}
