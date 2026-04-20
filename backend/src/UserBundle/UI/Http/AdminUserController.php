<?php

namespace App\UserBundle\UI\Http;

use App\UserBundle\Application\CreateUserUseCase;
use App\UserBundle\Application\DeleteUserUseCase;
use App\UserBundle\Application\GetUserUseCase;
use App\UserBundle\Application\ListUsersUseCase;
use App\UserBundle\Application\UpdateUserUseCase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users')]
#[IsGranted('ROLE_SUPER_ADMIN')]
class AdminUserController extends AbstractController
{
    #[Route('', name: 'api_admin_users_list', methods: ['GET'])]
    public function list(ListUsersUseCase $useCase): JsonResponse
    {
        $users = $useCase->execute();
        $data = array_map(fn($u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'roles' => $u->getRoles(),
        ], $users);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_admin_users_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getOne(int $id, GetUserUseCase $useCase): JsonResponse
    {
        try {
            $user = $useCase->execute($id);
            return $this->json([
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('', name: 'api_admin_users_create', methods: ['POST'])]
    public function create(Request $request, CreateUserUseCase $useCase): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $roles = $data['roles'] ?? ['ROLE_USER'];

        if (!$email || !$password) {
            return $this->json(['message' => 'Email and password are required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $useCase->execute($email, $password, $roles);
            return $this->json(['message' => 'User created successfully.'], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    #[Route('/{id}', name: 'api_admin_users_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, UpdateUserUseCase $useCase): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $roles = $data['roles'] ?? null;

        if ($roles === null) {
            return $this->json(['message' => 'Roles are required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $useCase->execute($id, $roles);
            return $this->json(['message' => 'User updated successfully.']);
        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }

    #[Route('/{id}', name: 'api_admin_users_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id, DeleteUserUseCase $useCase): JsonResponse
    {
        try {
            $useCase->execute($id);
            return $this->json(['message' => 'User deleted successfully.']);
        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
    }
}
