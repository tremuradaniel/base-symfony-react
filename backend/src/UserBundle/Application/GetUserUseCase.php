<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Entity\User;
use App\UserBundle\Domain\Repository\UserRepositoryInterface;

class GetUserUseCase
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function execute(int $id): User
    {
        $user = $this->userRepository->findById($id);

        if ($user === null) {
            throw new \Exception(sprintf('User with ID "%d" not found.', $id));
        }

        return $user;
    }
}
