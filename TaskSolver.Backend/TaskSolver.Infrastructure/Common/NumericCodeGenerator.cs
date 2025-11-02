using System.Security.Cryptography;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Infrastructure.Common;

public sealed class NumericCodeGenerator : ICodeGenerator
{
    private const int CodeLength = 6;
    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    public TemporaryCode GenerateCode()
    {
        var code = GenerateNumericCode(CodeLength);
        var expiry = DateTime.UtcNow.Add(Lifetime);

        return new TemporaryCode(code, expiry);
    }

    private static string GenerateNumericCode(int length)
    {
        Span<byte> bytes = stackalloc byte[length];
        RandomNumberGenerator.Fill(bytes);

        Span<char> digits = stackalloc char[length];
        for (int i = 0; i < length; i++)
        {
            digits[i] = (char)('0' + (bytes[i] % 10));
        }

        return new string(digits);
    }
}