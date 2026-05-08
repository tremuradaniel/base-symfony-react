<?php

namespace App\Tests\UserBundle\UI\Http;

use App\Tests\UserBundle\ApiTestCase;
use App\UserBundle\Application\RequestPasswordResetUseCase;
use App\UserBundle\Application\ResetPasswordUseCase;

/**
 * Functional tests for the password-reset use cases that back
 * POST /api/forgot-password and POST /api/reset-password.
 *
 * Tests call use cases directly through the DI container against the real
 * test database — pure PHPUnit + Symfony KernelTestCase, no HTTP simulation.
 */
class PasswordResetControllerTest extends ApiTestCase
{
    private RequestPasswordResetUseCase $requestResetUseCase;
    private ResetPasswordUseCase        $resetUseCase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->requestResetUseCase = $this->service(RequestPasswordResetUseCase::class);
        $this->resetUseCase        = $this->service(ResetPasswordUseCase::class);
    }

    // ── RequestPasswordResetUseCase (POST /api/forgot-password) ───────────────

    public function test_forgot_password_stores_reset_token_for_existing_user(): void
    {
        $this->seedUser('alice@example.com', 'secret123');

        $this->requestResetUseCase->execute('alice@example.com');

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertNotNull($user->getResetToken(), 'A reset token must be stored after the forgot-password request');
        self::assertNotEmpty($user->getResetToken());
    }

    public function test_forgot_password_sets_expiry_one_hour_in_future(): void
    {
        $this->seedUser('alice@example.com', 'secret123');

        $before = new \DateTimeImmutable();
        $this->requestResetUseCase->execute('alice@example.com');
        $after = new \DateTimeImmutable('+2 hours');

        $user    = $this->userRepository->findByEmail('alice@example.com');
        $expires = $user->getResetTokenExpiresAt();

        self::assertNotNull($expires);
        self::assertGreaterThan($before, $expires);
        self::assertLessThan($after, $expires);
    }

    public function test_forgot_password_with_unknown_email_does_not_throw(): void
    {
        // Must silently do nothing — do not reveal whether the email exists
        $this->expectNotToPerformAssertions();
        $this->requestResetUseCase->execute('nobody@example.com');
    }

    public function test_forgot_password_with_unknown_email_stores_no_token(): void
    {
        $this->requestResetUseCase->execute('nobody@example.com');

        // No user should exist for this email
        $user = $this->userRepository->findByEmail('nobody@example.com');
        self::assertNull($user);
    }

    public function test_each_forgot_password_request_generates_a_new_token(): void
    {
        $this->seedUser('alice@example.com', 'secret123');

        $this->requestResetUseCase->execute('alice@example.com');
        $firstToken = $this->userRepository->findByEmail('alice@example.com')->getResetToken();

        $this->requestResetUseCase->execute('alice@example.com');
        $secondToken = $this->userRepository->findByEmail('alice@example.com')->getResetToken();

        self::assertNotSame($firstToken, $secondToken, 'Each request must generate a fresh token');
    }

    // ── ResetPasswordUseCase (POST /api/reset-password) ───────────────────────

    public function test_reset_password_with_valid_token_hashes_new_password(): void
    {
        $this->seedUser('alice@example.com', 'secret123');
        $this->requestResetUseCase->execute('alice@example.com');
        $token = $this->userRepository->findByEmail('alice@example.com')->getResetToken();

        $this->resetUseCase->execute($token, 'brandnewpass');

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertNotSame('brandnewpass', $user->getPassword(), 'Password must be stored hashed');
        self::assertNotEmpty($user->getPassword());
    }

    public function test_reset_password_clears_token_after_success(): void
    {
        $this->seedUser('alice@example.com', 'secret123');
        $this->requestResetUseCase->execute('alice@example.com');
        $token = $this->userRepository->findByEmail('alice@example.com')->getResetToken();

        $this->resetUseCase->execute($token, 'newpassword123');

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertNull($user->getResetToken(), 'Token must be cleared after a successful reset');
        self::assertNull($user->getResetTokenExpiresAt());
    }

    public function test_reset_token_cannot_be_reused(): void
    {
        $this->seedUser('alice@example.com', 'secret123');
        $this->requestResetUseCase->execute('alice@example.com');
        $token = $this->userRepository->findByEmail('alice@example.com')->getResetToken();

        $this->resetUseCase->execute($token, 'newpassword123');

        $this->expectException(\InvalidArgumentException::class);
        $this->resetUseCase->execute($token, 'anotherpassword');
    }

    public function test_reset_password_with_invalid_token_throws(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/invalid|expired/i');

        $this->resetUseCase->execute('this-token-does-not-exist', 'newpassword');
    }

    public function test_reset_password_with_expired_token_throws(): void
    {
        $this->seedUser('alice@example.com', 'secret123');

        // Manually plant an expired token via the repository
        $user = $this->userRepository->findByEmail('alice@example.com');
        $user->setResetToken('expired-token-abc');
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('-1 hour'));
        $this->userRepository->save($user, true);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessageMatches('/expired/i');

        $this->resetUseCase->execute('expired-token-abc', 'newpassword');
    }
}
