<?php

namespace App\Tests\UserBundle\UI\Http;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Yaml\Yaml;

/**
 * Functional tests for the translation file loading that backs
 * GET /api/translations/{locale}.
 *
 * Tests parse the real YAML translation files directly — pure PHPUnit +
 * Symfony KernelTestCase, no HTTP simulation needed. Does NOT extend
 * ApiTestCase because no database access is required.
 */
class TranslationControllerTest extends KernelTestCase
{
    private string $translationsDir;

    protected function setUp(): void
    {
        parent::setUp();
        self::bootKernel();
        // Resolve the translations directory relative to the Symfony project root
        $this->translationsDir = static::getContainer()
            ->getParameter('kernel.project_dir') . '/translations';
    }

    // ── Translation file existence ────────────────────────────────────────────

    public function test_english_translation_file_exists(): void
    {
        $file = $this->translationsDir . '/messages.en.yaml';
        self::assertFileExists($file, 'English translation file must exist at translations/messages.en.yaml');
    }

    public function test_romanian_translation_file_exists(): void
    {
        $file = $this->translationsDir . '/messages.ro.yaml';
        self::assertFileExists($file, 'Romanian translation file must exist at translations/messages.ro.yaml');
    }

    // ── Translation file structure ────────────────────────────────────────────

    public function test_english_translations_parse_to_non_empty_array(): void
    {
        $file         = $this->translationsDir . '/messages.en.yaml';
        $translations = Yaml::parseFile($file);

        self::assertIsArray($translations);
        self::assertNotEmpty($translations, 'English translations file must not be empty');
    }

    public function test_romanian_translations_parse_to_non_empty_array(): void
    {
        $file         = $this->translationsDir . '/messages.ro.yaml';
        $translations = Yaml::parseFile($file);

        self::assertIsArray($translations);
        self::assertNotEmpty($translations, 'Romanian translations file must not be empty');
    }

    public function test_english_and_romanian_translations_have_same_keys(): void
    {
        $en = $this->flattenTranslations(
            Yaml::parseFile($this->translationsDir . '/messages.en.yaml')
        );
        $ro = $this->flattenTranslations(
            Yaml::parseFile($this->translationsDir . '/messages.ro.yaml')
        );

        $enKeys = array_keys($en);
        $roKeys = array_keys($ro);

        sort($enKeys);
        sort($roKeys);

        self::assertSame(
            $enKeys,
            $roKeys,
            'English and Romanian translation files must have the same set of keys',
        );
    }

    public function test_all_translation_values_are_non_empty_strings(): void
    {
        foreach (['en', 'ro'] as $locale) {
            $file   = $this->translationsDir . "/messages.{$locale}.yaml";
            $flat   = $this->flattenTranslations(Yaml::parseFile($file));

            foreach ($flat as $key => $value) {
                self::assertIsString(
                    $value,
                    "Translation key '{$key}' in {$locale} must be a string",
                );
                self::assertNotEmpty(
                    $value,
                    "Translation key '{$key}' in {$locale} must not be empty",
                );
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Recursively flatten a nested translation array into dot-notation keys.
     *
     * e.g. ['login' => ['welcome' => 'Welcome Back']] becomes
     *      ['login.welcome' => 'Welcome Back']
     *
     * @param array<string, mixed> $translations
     * @return array<string, string>
     */
    private function flattenTranslations(array $translations, string $prefix = ''): array
    {
        $flat = [];

        foreach ($translations as $key => $value) {
            $fullKey = $prefix !== '' ? "{$prefix}.{$key}" : (string) $key;

            if (is_array($value)) {
                $flat = array_merge($flat, $this->flattenTranslations($value, $fullKey));
            } else {
                $flat[$fullKey] = $value;
            }
        }

        return $flat;
    }

    // ── Supported locale list (mirrors TranslationController) ────────────────

    public function test_supported_locales_have_translation_files(): void
    {
        $supported = ['en', 'ro'];

        foreach ($supported as $locale) {
            $file = $this->translationsDir . "/messages.{$locale}.yaml";
            self::assertFileExists(
                $file,
                "A translation file must exist for every supported locale: '{$locale}'",
            );
        }
    }
}
