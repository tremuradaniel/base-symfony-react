<?php

namespace App\UserBundle\Domain\Repository;

use App\UserBundle\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function save(User $user, bool $flush = false): void;
    public function findByEmail(string $email): ?User;
}
