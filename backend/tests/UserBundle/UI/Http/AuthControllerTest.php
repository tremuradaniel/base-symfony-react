<?php

namespace App\Tests\UserBundle\UI\Http;

use App\Tests\UserBundle\ApiTestCase;
use App\UserBundle\Application\CreateUserUseCase;


/**
 * Functional tests for the Auth use-cases that back the /api/login and /api/me endpoints.
 *
 * Instead of simulating HTTP we exercise the real application services through the DI
 * container against the test database — pure PHPUnit + Symfony KernelTestCase.
 */
class AuthControllerTest extends ApiTestCase
{
    private CreateUserUseCase $createUserUseCase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createUserUseCase = $this->service(CreateUserUseCase::class);
    }

    // ── User creation (underlies POST /api/login) ─────────────────────────────

    public function test_create_user_persists_to_database(): void
    {
        $this->createUserUseCase->execute('alice@example.com', 'secret123');

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertNotNull($user);
        self::assertSame('alice@example.com', $user->getEmail());
    }

    public function test_create_user_hashes_password(): void
    {
        $this->createUserUseCase->execute('alice@example.com', 'secret123');

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertNotSame('secret123', $user->getPassword(), 'Password must be stored hashed, not in plaintext');
        self::assertNotEmpty($user->getPassword());
    }

    public function test_create_user_stores_correct_roles(): void
    {
        $this->createUserUseCase->execute('alice@example.com', 'secret123', ['ROLE_USER']);

        $user = $this->userRepository->findByEmail('alice@example.com');
        self::assertContains('ROLE_USER', $user->getRoles());
    }

    public function test_create_super_admin_stores_correct_roles(): void
    {
        $this->createUserUseCase->execute('admin@example.com', 'adminpass', ['ROLE_SUPER_ADMIN']);

        $user = $this->userRepository->findByEmail('admin@example.com');
        self::assertContains('ROLE_SUPER_ADMIN', $user->getRoles());
        // getRoles() always guarantees ROLE_USER too
        self::assertContains('ROLE_USER', $user->getRoles());
    }

    public function test_create_duplicate_user_throws_exception(): void
    {
        $this->createUserUseCase->execute('alice@example.com', 'secret123');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/already exists/i');

        $this->createUserUseCase->execute('alice@example.com', 'otherpass');
    }

    // ── User lookup (underlies GET /api/me) ───────────────────────────────────

    public function test_find_user_by_email_returns_correct_entity(): void
    {
        $this->createUserUseCase->execute('bob@example.com', 'bobpass', ['ROLE_USER']);

        $user = $this->userRepository->findByEmail('bob@example.com');

        self::assertNotNull($user);
        self::assertSame('bob@example.com', $user->getEmail());
    }

    public function test_find_by_email_returns_null_for_unknown_email(): void
    {
        $user = $this->userRepository->findByEmail('nobody@example.com');

        self::assertNull($user);
    }

    public function test_find_user_by_id_returns_correct_entity(): void
    {
        $seeded = $this->seedUser('carol@example.com', 'pass');

        $found = $this->userRepository->findById($seeded->getId());

        self::assertNotNull($found);
        self::assertSame('carol@example.com', $found->getEmail());
    }

    public function test_find_by_id_returns_null_for_unknown_id(): void
    {
        $user = $this->userRepository->findById(99999);

        self::assertNull($user);
    }
}

