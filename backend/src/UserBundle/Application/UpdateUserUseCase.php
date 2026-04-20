<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Repository\UserRepositoryInterface;

class UpdateUserUseCase
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * @param string[] $roles
     */
    public function execute(int $id, array $roles): void
    {
        $user = $this->userRepository->findById($id);

        if ($user === null) {
            throw new \Exception(sprintf('User with ID "%d" not found.', $id));
        }

        $user->setRoles($roles);

        $this->userRepository->save($user, true);
    }
}
