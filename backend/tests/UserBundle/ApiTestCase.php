<?php

namespace App\Tests\UserBundle;

use App\UserBundle\Application\CreateUserUseCase;
use App\UserBundle\Domain\Entity\User;
use App\UserBundle\Domain\Repository\UserRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;


/**
 * Base class for all functional tests.
 *
 * Uses Symfony's KernelTestCase (a thin wrapper over PHPUnit\Framework\TestCase)
 * to boot the real application kernel and interact with the DI container directly.
 * No HTTP simulation — tests exercise the application layer (use cases + repositories)
 * against the real test database.
 */
abstract class ApiTestCase extends KernelTestCase
{
    protected EntityManagerInterface $em;
    protected UserRepositoryInterface $userRepository;

    protected function setUp(): void
    {
        parent::setUp();
        self::bootKernel();

        $this->em             = $this->service(EntityManagerInterface::class);
        $this->userRepository = $this->service(UserRepositoryInterface::class);

        $this->resetDatabase();
    }

    protected function tearDown(): void
    {
        // Close the EM to avoid state leaking between test classes
        $this->em->close();
        parent::tearDown();
    }

    // ── Container helper ─────────────────────────────────────────────────────

    /**
     * Retrieve a service from the test container.
     *
     * @template T of object
     * @param class-string<T> $id
     * @return T
     */
    protected function service(string $id): object
    {
        /** @var T */
        return static::getContainer()->get($id);
    }

    // ── Database helpers ─────────────────────────────────────────────────────

    /**
     * Drops and recreates the test schema before each test so every test
     * starts from a clean database state.
     */
    protected function resetDatabase(): void
    {
        $schemaTool = new SchemaTool($this->em);
        $metadata   = $this->em->getMetadataFactory()->getAllMetadata();

        $schemaTool->dropSchema($metadata);
        $schemaTool->createSchema($metadata);
    }

    /**
     * Creates a user via the real CreateUserUseCase (hashes password, persists).
     */
    protected function seedUser(
        string $email,
        string $password,
        array  $roles = ['ROLE_USER'],
    ): User {
        $this->service(CreateUserUseCase::class)->execute($email, $password, $roles);

        $user = $this->userRepository->findByEmail($email);
        self::assertNotNull($user, "seedUser: could not find persisted user '{$email}'");

        return $user;
    }
}
