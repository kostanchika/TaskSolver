using FluentValidation;
using TaskSolver.Core.Application.Users.Commands;

namespace TaskSolver.Core.Application.Users.Validators;

public sealed class ChangeEmailValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Почта не может быть пустой")
            .EmailAddress().WithMessage("Неверный формат почты");
    }
}
