<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Repository\UserRepositoryInterface;
use App\UserBundle\Domain\Service\PasswordHasherInterface;

class ResetPasswordUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly PasswordHasherInterface $passwordHasher,
    ) {}

    public function execute(string $token, string $newPassword): void
    {
        $user = $this->userRepository->findByResetToken($token);

        if ($user === null) {
            throw new \InvalidArgumentException('Invalid or expired reset token.');
        }

        if ($user->getResetTokenExpiresAt() === null || $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            throw new \InvalidArgumentException('Reset token has expired.');
        }

        $user->setPassword($this->passwordHasher->hash($newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);

        $this->userRepository->save($user, true);
    }
}