using FluentValidation;
using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Core.Application.Users.Validators;

public sealed class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Пароль не должен быть пустым")
            .Length(8, 20).WithMessage("Пароль должен содержать от 8 до 20 символов")
            .Matches(@"[A-Z]").WithMessage("Пароль должен содержать хотя бы одну заглавную букву")
            .Matches(@"[0-9]").WithMessage("Пароль должен содержать хотя бы одну цифру")
            .Matches(@"[!@#$%^&*(),.?""{}|<>_\-+=\\/[\]`~]").WithMessage("Пароль должен содержать хотя бы один спецсимвол")
            .Matches(@"^[a-zA-Z0-9!@#$%^&*(),.?""{}|<>_\-+=\\/[\]`~]+$").WithMessage("Пароль должен содержать только латинские символы");
    }
}
