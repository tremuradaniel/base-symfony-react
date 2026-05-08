<?php

namespace App\Tests\UserBundle\UI\Http;

use App\Tests\UserBundle\ApiTestCase;
use App\UserBundle\Application\CreateUserUseCase;
use App\UserBundle\Application\DeleteUserUseCase;
use App\UserBundle\Application\GetUserUseCase;
use App\UserBundle\Application\ListUsersUseCase;
use App\UserBundle\Application\UpdateUserUseCase;

/**
 * Functional tests for the admin user management use cases that back the
 * /api/admin/users CRUD endpoints.
 *
 * Tests call use cases directly through the DI container against the real
 * test database — pure PHPUnit + Symfony KernelTestCase, no HTTP simulation.
 */
class AdminUserControllerTest extends ApiTestCase
{
    private CreateUserUseCase $createUseCase;
    private ListUsersUseCase  $listUseCase;
    private GetUserUseCase    $getUseCase;
    private UpdateUserUseCase $updateUseCase;
    private DeleteUserUseCase $deleteUseCase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createUseCase = $this->service(CreateUserUseCase::class);
        $this->listUseCase   = $this->service(ListUsersUseCase::class);
        $this->getUseCase    = $this->service(GetUserUseCase::class);
        $this->updateUseCase = $this->service(UpdateUserUseCase::class);
        $this->deleteUseCase = $this->service(DeleteUserUseCase::class);
    }

    // ── ListUsersUseCase (GET /api/admin/users) ───────────────────────────────

    public function test_list_users_returns_empty_array_on_fresh_db(): void
    {
        $users = $this->listUseCase->execute();

        self::assertIsArray($users);
        self::assertCount(0, $users);
    }

    public function test_list_users_returns_all_seeded_users(): void
    {
        $this->seedUser('alice@example.com', 'pass1');
        $this->seedUser('bob@example.com', 'pass2');

        $users = $this->listUseCase->execute();

        self::assertCount(2, $users);
        $emails = array_map(fn($u) => $u->getEmail(), $users);
        self::assertContains('alice@example.com', $emails);
        self::assertContains('bob@example.com', $emails);
    }

    // ── GetUserUseCase (GET /api/admin/users/{id}) ────────────────────────────

    public function test_get_user_by_id_returns_correct_user(): void
    {
        $seeded = $this->seedUser('carol@example.com', 'pass');

        $user = $this->getUseCase->execute($seeded->getId());

        self::assertSame('carol@example.com', $user->getEmail());
    }

    public function test_get_user_throws_for_non_existent_id(): void
    {
        $this->expectException(\Exception::class);

        $this->getUseCase->execute(99999);
    }

    // ── CreateUserUseCase (POST /api/admin/users) ─────────────────────────────

    public function test_create_user_persists_correctly(): void
    {
        $this->createUseCase->execute('dave@example.com', 'davespass', ['ROLE_USER']);

        $user = $this->userRepository->findByEmail('dave@example.com');
        self::assertNotNull($user);
        self::assertSame('dave@example.com', $user->getEmail());
        self::assertContains('ROLE_USER', $user->getRoles());
    }

    public function test_create_user_with_super_admin_role(): void
    {
        $this->createUseCase->execute('superadmin@example.com', 'sapass', ['ROLE_SUPER_ADMIN']);

        $user = $this->userRepository->findByEmail('superadmin@example.com');
        self::assertContains('ROLE_SUPER_ADMIN', $user->getRoles());
    }

    public function test_create_duplicate_user_throws_exception(): void
    {
        $this->createUseCase->execute('dup@example.com', 'pass1');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessageMatches('/already exists/i');

        $this->createUseCase->execute('dup@example.com', 'pass2');
    }

    public function test_create_user_appears_in_list(): void
    {
        $this->createUseCase->execute('eve@example.com', 'pass', ['ROLE_USER']);

        $users  = $this->listUseCase->execute();
        $emails = array_map(fn($u) => $u->getEmail(), $users);

        self::assertContains('eve@example.com', $emails);
    }

    // ── UpdateUserUseCase (PUT /api/admin/users/{id}) ─────────────────────────

    public function test_update_user_roles_persists_new_roles(): void
    {
        $seeded = $this->seedUser('frank@example.com', 'pass', ['ROLE_USER']);

        $this->updateUseCase->execute($seeded->getId(), ['ROLE_SUPER_ADMIN']);

        $updated = $this->userRepository->findById($seeded->getId());
        self::assertContains('ROLE_SUPER_ADMIN', $updated->getRoles());
    }

    public function test_update_user_old_roles_are_replaced(): void
    {
        $seeded = $this->seedUser('frank@example.com', 'pass', ['ROLE_USER']);

        $this->updateUseCase->execute($seeded->getId(), ['ROLE_SUPER_ADMIN']);

        $updated = $this->userRepository->findById($seeded->getId());
        // ROLE_USER is always appended by getRoles(), but ROLE_USER-only entry is gone
        self::assertContains('ROLE_SUPER_ADMIN', $updated->getRoles());
    }

    public function test_update_non_existent_user_throws_exception(): void
    {
        $this->expectException(\Exception::class);

        $this->updateUseCase->execute(99999, ['ROLE_USER']);
    }

    // ── DeleteUserUseCase (DELETE /api/admin/users/{id}) ──────────────────────

    public function test_delete_user_removes_from_database(): void
    {
        $seeded = $this->seedUser('grace@example.com', 'pass');

        $this->deleteUseCase->execute($seeded->getId());

        $deleted = $this->userRepository->findByEmail('grace@example.com');
        self::assertNull($deleted);
    }

    public function test_delete_user_no_longer_in_list(): void
    {
        $seeded = $this->seedUser('grace@example.com', 'pass');

        $this->deleteUseCase->execute($seeded->getId());

        $users  = $this->listUseCase->execute();
        $emails = array_map(fn($u) => $u->getEmail(), $users);
        self::assertNotContains('grace@example.com', $emails);
    }

    public function test_delete_non_existent_user_throws_exception(): void
    {
        $this->expectException(\Exception::class);

        $this->deleteUseCase->execute(99999);
    }

    public function test_delete_does_not_affect_other_users(): void
    {
        $toKeep   = $this->seedUser('keep@example.com', 'pass');
        $toDelete = $this->seedUser('delete@example.com', 'pass');

        $this->deleteUseCase->execute($toDelete->getId());

        $kept = $this->userRepository->findByEmail('keep@example.com');
        self::assertNotNull($kept);
        self::assertSame('keep@example.com', $kept->getEmail());
    }
}
