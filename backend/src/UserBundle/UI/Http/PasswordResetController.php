<?php

namespace App\UserBundle\UI\Http;

use App\UserBundle\Application\RequestPasswordResetUseCase;
use App\UserBundle\Application\ResetPasswordUseCase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PasswordResetController extends AbstractController
{
    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        RequestPasswordResetUseCase $useCase,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = trim($data['email'] ?? '');

        if ($email === '') {
            return $this->json(['message' => 'Email is required.'], 400);
        }

        // Always return success — do not reveal whether the email exists
        $useCase->execute($email);

        return $this->json(['message' => 'If this email is registered, a reset link has been sent.']);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        ResetPasswordUseCase $useCase,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $token = trim($data['token'] ?? '');
        $password = $data['password'] ?? '';

        if ($token === '' || $password === '') {
            return $this->json(['message' => 'Token and password are required.'], 400);
        }

        try {
            $useCase->execute($token, $password);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }

        return $this->json(['message' => 'Password has been reset successfully.']);
    }
}