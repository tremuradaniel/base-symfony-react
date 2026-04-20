<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Repository\UserRepositoryInterface;

class ListUsersUseCase
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function execute(): array
    {
        return $this->userRepository->findAll();
    }
}
