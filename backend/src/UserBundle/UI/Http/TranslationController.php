<?php

namespace App\UserBundle\UI\Http;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Yaml\Yaml;

class TranslationController extends AbstractController
{
    #[Route('/api/translations/{locale}', name: 'api_translations', methods: ['GET'])]
    public function translations(string $locale): JsonResponse
    {
        $supported = ['en', 'ro'];

        if (!in_array($locale, $supported, true)) {
            $locale = 'en';
        }

        $file = $this->getParameter('kernel.project_dir') . '/translations/messages.' . $locale . '.yaml';

        if (!file_exists($file)) {
            return $this->json(['error' => 'Translations not found'], 404);
        }

        $translations = Yaml::parseFile($file);

        return $this->json($translations);
    }
}