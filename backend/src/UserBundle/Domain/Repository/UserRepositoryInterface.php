<?php

namespace App\UserBundle\Domain\Repository;

use App\UserBundle\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function save(User $user, bool $flush = false): void;

    public function findByEmail(string $email): ?User;

    public function findById(int $id): ?User;

    /**
     * @return User[]
     */
    public function findAll(): array;

    public function remove(User $user, bool $flush = false): void;
}
