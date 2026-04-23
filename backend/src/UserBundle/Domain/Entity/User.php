<?php

namespace App\UserBundle\Domain\Entity;

class User
{
    private ?int $id = null;
    private string $email;
    private array $roles = [];
    private string $password;
    private ?string $resetToken = null;
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    public function __construct(string $email, array $roles = [])
    {
        $this->email = $email;
        $this->roles = $roles;
    }

    /**
     * Reconstitutes a User from persistence. Use only in repository implementations.
     */
    public static function reconstitute(
        int $id,
        string $email,
        array $roles,
        string $password,
        ?string $resetToken = null,
        ?\DateTimeImmutable $resetTokenExpiresAt = null,
    ): self {
        $user = new self($email, $roles);
        $user->id = $id;
        $user->password = $password;
        $user->resetToken = $resetToken;
        $user->resetTokenExpiresAt = $resetTokenExpiresAt;

        return $user;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self
    {
        $this->resetToken = $resetToken;

        return $this;
    }

    public function getResetTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?\DateTimeImmutable $resetTokenExpiresAt): self
    {
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;

        return $this;
    }
}
