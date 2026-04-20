<?php

namespace App\UserBundle\UI\Http;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\UserBundle\Infrastructure\Persistence\Doctrine\Entity\UserDoctrineEntity;

class AuthController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?UserDoctrineEntity $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        return $this->json([
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
