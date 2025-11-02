using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Core.Application.Common.Interfaces;

public interface ICodeGenerator
{
    TemporaryCode GenerateCode();
}
