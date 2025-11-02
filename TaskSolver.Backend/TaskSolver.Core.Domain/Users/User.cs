using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users.Constants;
using TaskSolver.Core.Domain.Users.Events;

namespace TaskSolver.Core.Domain.Users;

public sealed class User : AggregateRoot
{
    public string Email { get; private set; }
    public string Role { get; private set; }

    public string? PasswordHash { get; private set; }
    public string? PasswordResetCode { get; private set; }
    public DateTime? PasswordResetCodeExpiry { get; private set; }

    public string? EmailConfirmationCode { get; private set; }
    public DateTime? EmailConfirmationCodeExpiry { get; private set; }
    public DateTime? EmailConfirmedAt { get; private set; }

    public List<ExternalLogin> ExternalLogins { get;}

    public DateTime CreatedAt { get; }

    private User() 
    {
        Email = null!;
        Role = null!;
        ExternalLogins = null!;
    }

    private User(string email, string? passwordHash)
    {
        Email = email;
        PasswordHash = passwordHash;
        Role = UserRoles.Programmer;
        EmailConfirmationCode = null;
        EmailConfirmedAt = null;
        ExternalLogins = [];

        CreatedAt = DateTime.UtcNow;

        AddDomainEvent(new UserCreatedEvent(Id, Email));
    }

    public static User Register(string email, string passwordHash)
        => new(email, passwordHash);

    public static User Register(ExternalLogin externalLogin)
    {
        var user = new User(externalLogin.Email, null);

        user.LinkExternalAccount(externalLogin);

        return user;
    }

    public Result SetPasswordResetCode(string code, DateTime codeExpiry)
    {
        PasswordResetCode = code;
        PasswordResetCodeExpiry = codeExpiry;

        AddDomainEvent(new PasswordResetCodeIsSetEvent(Id, Email, code));

        return Result.Ok();
    }

    public Result ResetPassword(string code, string newPasswordHash)
    {
        if (PasswordResetCodeExpiry < DateTime.UtcNow)
        {
            return Result.Fail("Код сброса пароля устарел", ErrorCode.BadRequest);
        }
        if (PasswordResetCode != code)
        {
            return Result.Fail("Неверный код сброса пароля", ErrorCode.BadRequest);
        }

        PasswordHash = newPasswordHash;
        PasswordResetCode = null;
        PasswordResetCodeExpiry = null;

        AddDomainEvent(new PasswordResetEvent(Id, Email));

        return Result.Ok();
    }

    public Result SetEmailConfirmationCode(string code, DateTime codeExpiry)
    {
        if (EmailConfirmedAt is not null)
        {
            return Result.Fail("Почта уже подтвеждена", ErrorCode.Conflict);
        }

        EmailConfirmationCode = code;
        EmailConfirmationCodeExpiry = codeExpiry;

        AddDomainEvent(new EmailConfirmationCodeIsSetEvent(Id, Email, code));

        return Result.Ok();
    }

    public Result ConfirmEmail(string code)
    {
        if (EmailConfirmationCodeExpiry < DateTime.UtcNow)
        {
            return Result.Fail("Код подтверждения почты устарел", ErrorCode.BadRequest);
        }
        if (EmailConfirmationCode != code)
        {
            return Result.Fail("Неверный код подтверждения почты", ErrorCode.BadRequest);
        }

        EmailConfirmationCode = null;
        EmailConfirmationCodeExpiry = null;
        EmailConfirmedAt = DateTime.UtcNow;

        AddDomainEvent(new EmailConfirmedEvent(Id, Email));

        return Result.Ok();
    }

    public void ChangeEmail(string newEmail)
    {
        var oldEmail = Email;

        Email = newEmail;
        EmailConfirmationCode = null;
        EmailConfirmationCodeExpiry = null;
        EmailConfirmedAt = null;

        AddDomainEvent(new EmailChangedEvent(Id, oldEmail, newEmail));
    }

    public Result LinkExternalAccount(ExternalLogin externalLogin)
    {
        if (ExternalLogins.Any(l => l.Provider == externalLogin.Provider))
        {
            return Result.Fail("Сервис уже привязан", ErrorCode.Conflict);
        }

        ExternalLogins.Add(externalLogin);

        AddDomainEvent(new ExternalAccountLinkedEvent(Id, externalLogin));

        return Result.Ok();
    }
}
