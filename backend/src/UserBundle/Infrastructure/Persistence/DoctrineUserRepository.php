<?php

namespace App\UserBundle\Infrastructure\Persistence;

use App\UserBundle\Domain\Entity\User;
use App\UserBundle\Domain\Repository\UserRepositoryInterface;
use App\UserBundle\Infrastructure\Persistence\Doctrine\Entity\UserDoctrineEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class DoctrineUserRepository extends ServiceEntityRepository implements UserRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserDoctrineEntity::class);
    }

    public function save(User $user, bool $flush = false): void
    {
        $doctrineEntity = $this->findOneBy(['email' => $user->getEmail()])
            ?? new UserDoctrineEntity($user->getEmail(), $user->getRoles(), $user->getPassword());

        $doctrineEntity->setRoles($user->getRoles());
        $doctrineEntity->setPassword($user->getPassword());
        $doctrineEntity->setResetToken($user->getResetToken());
        $doctrineEntity->setResetTokenExpiresAt($user->getResetTokenExpiresAt());

        $this->getEntityManager()->persist($doctrineEntity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findByEmail(string $email): ?User
    {
        $doctrineEntity = $this->findOneBy(['email' => $email]);

        if ($doctrineEntity === null) {
            return null;
        }

        return $this->toDomain($doctrineEntity);
    }

    public function findById(int $id): ?User
    {
        $doctrineEntity = $this->find($id);

        if ($doctrineEntity === null) {
            return null;
        }

        return $this->toDomain($doctrineEntity);
    }

    public function findAll(): array
    {
        $entities = parent::findAll();

        return array_map(fn(UserDoctrineEntity $e) => $this->toDomain($e), $entities);
    }

    public function remove(User $user, bool $flush = false): void
    {
        $doctrineEntity = $this->find($user->getId());

        if ($doctrineEntity !== null) {
            $this->getEntityManager()->remove($doctrineEntity);

            if ($flush) {
                $this->getEntityManager()->flush();
            }
        }
    }

    public function findByResetToken(string $token): ?User
    {
        $entity = $this->findOneBy(['resetToken' => $token]);

        if ($entity === null) {
            return null;
        }

        return $this->toDomain($entity);
    }

    private function toDomain(UserDoctrineEntity $entity): User
    {
        return User::reconstitute(
            $entity->getId(),
            $entity->getEmail(),
            $entity->getRoles(),
            $entity->getPassword(),
            $entity->getResetToken(),
            $entity->getResetTokenExpiresAt(),
        );
    }
}
