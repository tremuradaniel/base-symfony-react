<?php

namespace App\UserBundle\Application;

use App\UserBundle\Domain\Entity\User;
use App\UserBundle\Domain\Repository\UserRepositoryInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class CreateUserUseCase
{
    private UserRepositoryInterface $userRepository;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UserRepositoryInterface $userRepository,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * @param string[] $roles
     */
    public function execute(string $email, string $password, array $roles = ['ROLE_USER']): void
    {
        if ($this->userRepository->findByEmail($email)) {
            throw new \Exception(sprintf('User with email "%s" already exists.', $email));
        }

        $user = new User($email, $roles);
        
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $password
        );
        $user->setPassword($hashedPassword);

        $this->userRepository->save($user, true);
    }
}
