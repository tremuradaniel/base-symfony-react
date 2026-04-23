<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Repository\UserRepositoryInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class RequestPasswordResetUseCase
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly MailerInterface $mailer,
        private readonly string $frontendUrl,
        private readonly string $fromEmail,
    ) {}

    public function execute(string $email): void
    {
        $user = $this->userRepository->findByEmail($email);

        // Always return without error — do not reveal whether the email exists
        if ($user === null) {
            return;
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('+1 hour');

        $user->setResetToken($token);
        $user->setResetTokenExpiresAt($expiresAt);

        $this->userRepository->save($user, true);

        $resetLink = rtrim($this->frontendUrl, '/') . '/reset-password?token=' . $token;

        $message = (new Email())
            ->from($this->fromEmail)
            ->to($user->getEmail())
            ->subject('Password Reset Request')
            ->html($this->buildHtml($resetLink))
            ->text('Reset your password by visiting: ' . $resetLink . "\n\nThis link expires in 1 hour.");

        $this->mailer->send($message);
    }

    private function buildHtml(string $resetLink): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, Arial, sans-serif; background: #08090f; color: #f8fafc; padding: 40px;">
          <div style="max-width: 480px; margin: 0 auto; background: #131522; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.06);">
            <h2 style="color: #6366f1; margin-top: 0;">Password Reset</h2>
            <p style="color: #94a3b8;">You requested a password reset. Click the button below to set a new password. This link expires in <strong style="color: #f8fafc;">1 hour</strong>.</p>
            <a href="{$resetLink}"
               style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; margin: 20px 0;">
              Reset Password
            </a>
            <p style="color: #475569; font-size: 0.8rem; margin-bottom: 0;">If you did not request this, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
        HTML;
    }
}