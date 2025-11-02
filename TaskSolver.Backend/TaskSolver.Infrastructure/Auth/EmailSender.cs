using FluentEmail.Core;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure.Common;

namespace TaskSolver.Infrastructure.Auth;

public sealed class EmailSender(IFluentEmail fluentEmail) : IEmailSender
{
    public async Task SendConfirmationEmailAsync(User user, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(user.EmailConfirmationCode))
            throw new InvalidOperationException("EmailConfirmationCode is not set.");

        var subject = "Подтверждение email";
        var body = $"""
            Здравствуйте!

            Ваш код подтверждения: **{user.EmailConfirmationCode}**
            Код действителен в течении {NumericCodeGenerator.Lifetime.Minutes} минут
            """;

        await SendEmailAsync(user.Email, subject, body);
    }

    public async Task SendResetPasswordEmailAsync(User user, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(user.PasswordResetCode))
            throw new InvalidOperationException("PasswordResetCode is not set.");

        var subject = "Сброс пароля";
        var body = $"""
            Здравствуйте!

            Ваш код сброса пароля: **{user.PasswordResetCode}**
            Код действителен в течении {NumericCodeGenerator.Lifetime.Minutes} минут
            """;

        await SendEmailAsync(user.Email, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var response = await fluentEmail
            .To(toEmail)
            .Subject(subject)
            .Body(body)
            .SendAsync();

        if (!response.Successful)
        {
            var error = string.Join("; ", response.ErrorMessages);
            throw new InvalidOperationException($"Ошибка отправки письма: {error}");
        }
    }
}