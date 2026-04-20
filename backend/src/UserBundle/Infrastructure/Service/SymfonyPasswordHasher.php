<?php

namespace App\UserBundle\Infrastructure\Service;

use App\UserBundle\Domain\Service\PasswordHasherInterface;
use App\UserBundle\Infrastructure\Persistence\Doctrine\Entity\UserDoctrineEntity;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;

class SymfonyPasswordHasher implements PasswordHasherInterface
{
    private PasswordHasherFactoryInterface $hasherFactory;

    public function __construct(PasswordHasherFactoryInterface $hasherFactory)
    {
        $this->hasherFactory = $hasherFactory;
    }

    public function hash(string $plainPassword): string
    {
        // Use the same hasher configured for our infrastructure entity
        $hasher = $this->hasherFactory->getPasswordHasher(UserDoctrineEntity::class);
        
        return $hasher->hash($plainPassword);
    }

    public function verify(string $hashedPassword, string $plainPassword): bool
    {
        $hasher = $this->hasherFactory->getPasswordHasher(UserDoctrineEntity::class);
        
        return $hasher->verify($hashedPassword, $plainPassword);
    }
}
