<?php

namespace App\Tests\UserBundle\Domain;

use App\UserBundle\Domain\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    // ── Construction ─────────────────────────────────────────────────────────

    public function test_new_user_has_correct_email(): void
    {
        $user = new User('alice@example.com');
        self::assertSame('alice@example.com', $user->getEmail());
    }

    public function test_new_user_id_is_null(): void
    {
        $user = new User('alice@example.com');
        self::assertNull($user->getId());
    }

    // ── getRoles always guarantees ROLE_USER ─────────────────────────────────

    public function test_get_roles_always_includes_role_user(): void
    {
        $user = new User('alice@example.com', []);
        self::assertContains('ROLE_USER', $user->getRoles());
    }

    public function test_get_roles_does_not_duplicate_role_user(): void
    {
        $user = new User('alice@example.com', ['ROLE_USER']);
        $roles = $user->getRoles();
        self::assertCount(1, array_filter($roles, fn($r) => $r === 'ROLE_USER'));
    }

    public function test_get_roles_returns_custom_roles_plus_role_user(): void
    {
        $user = new User('admin@example.com', ['ROLE_SUPER_ADMIN']);
        $roles = $user->getRoles();
        self::assertContains('ROLE_SUPER_ADMIN', $roles);
        self::assertContains('ROLE_USER', $roles);
    }

    // ── Setters ──────────────────────────────────────────────────────────────

    public function test_set_roles_updates_roles(): void
    {
        $user = new User('alice@example.com');
        $user->setRoles(['ROLE_EDITOR']);
        self::assertContains('ROLE_EDITOR', $user->getRoles());
    }

    public function test_set_password_updates_password(): void
    {
        $user = new User('alice@example.com');
        $user->setPassword('hashed_pw');
        self::assertSame('hashed_pw', $user->getPassword());
    }

    public function test_set_reset_token_updates_token(): void
    {
        $user = new User('alice@example.com');
        $user->setResetToken('abc123');
        self::assertSame('abc123', $user->getResetToken());
    }

    public function test_set_reset_token_can_be_null(): void
    {
        $user = new User('alice@example.com');
        $user->setResetToken('abc123');
        $user->setResetToken(null);
        self::assertNull($user->getResetToken());
    }

    public function test_set_reset_token_expires_at(): void
    {
        $user = new User('alice@example.com');
        $dt = new \DateTimeImmutable('+1 hour');
        $user->setResetTokenExpiresAt($dt);
        self::assertSame($dt, $user->getResetTokenExpiresAt());
    }

    public function test_reset_token_expires_at_can_be_null(): void
    {
        $user = new User('alice@example.com');
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
        $user->setResetTokenExpiresAt(null);
        self::assertNull($user->getResetTokenExpiresAt());
    }

    // ── Reconstitute ─────────────────────────────────────────────────────────

    public function test_reconstitute_restores_all_fields(): void
    {
        $dt = new \DateTimeImmutable('+1 hour');
        $user = User::reconstitute(
            id: 42,
            email: 'bob@example.com',
            roles: ['ROLE_SUPER_ADMIN'],
            password: 'hashed',
            resetToken: 'tok',
            resetTokenExpiresAt: $dt,
        );

        self::assertSame(42, $user->getId());
        self::assertSame('bob@example.com', $user->getEmail());
        self::assertContains('ROLE_SUPER_ADMIN', $user->getRoles());
        self::assertSame('hashed', $user->getPassword());
        self::assertSame('tok', $user->getResetToken());
        self::assertSame($dt, $user->getResetTokenExpiresAt());
    }

    public function test_reconstitute_with_null_reset_fields(): void
    {
        $user = User::reconstitute(
            id: 1,
            email: 'bob@example.com',
            roles: [],
            password: 'hashed',
        );

        self::assertNull($user->getResetToken());
        self::assertNull($user->getResetTokenExpiresAt());
    }
}
