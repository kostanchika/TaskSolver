using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;
using TaskSolver.Core.Application.Users.Interfaces;

namespace TaskSolver.Infrastructure.Auth;

public sealed class Argon2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 4;
    private const int MemorySize = 65536;
    private const int DegreeOfParallelism = 2;

    public string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            Iterations = Iterations,
            MemorySize = MemorySize,
            DegreeOfParallelism = DegreeOfParallelism
        };

        var hash = argon2.GetBytes(HashSize);

        return $"{Iterations}.{MemorySize}.{DegreeOfParallelism}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string hash)
    {
        var parts = hash.Split('.');
        if (parts.Length != 5)
        {
            return false;
        }

        var iterations = int.Parse(parts[0]);
        var memorySize = int.Parse(parts[1]);
        var parallelism = int.Parse(parts[2]);
        var salt = Convert.FromBase64String(parts[3]);
        var expectedHash = Convert.FromBase64String(parts[4]);

        var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            Iterations = iterations,
            MemorySize = memorySize,
            DegreeOfParallelism = parallelism
        };

        var actualHash = argon2.GetBytes(expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
