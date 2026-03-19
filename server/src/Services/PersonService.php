<?php

namespace App\Services;

use App\Http\Error\HttpConflictException;
use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Person;
use DateTime;

class PersonService
{
    public function __construct(protected CondominiumService $condominiumService) {}

    public function list()
    {
        $people = Person::with('createdByCondominium')->get();

        return $people;
    }

    public function find(int $id): Person
    {
        $person = Person::with('createdByCondominium')->find($id);

        if (!$person) {
            throw new HttpNotFoundException('Person not found');
        }

        return $person;
    }

    public function create(array $data): Person
    {
        $normalizedCpf = $this->normalizeCpf($data['cpf'] ?? null);

        $this->validatePersonData($data, $normalizedCpf);

        if (Person::where('cpf', $normalizedCpf)->exists()) {
            throw new HttpConflictException('CPF already exists');
        }

        if (!empty($data['created_by_condominium_id'])) {
            $this->validateCondominium((int)$data['created_by_condominium_id']);
        }

        $person = Person::create([
            'full_name' => $data['full_name'],
            'cpf' => $normalizedCpf,
            'email' => $data['email'],
            'birth_date' => $data['birth_date'],
            'created_by_condominium_id' => $data['created_by_condominium_id'] ?? null
        ]);

        return $person->load('createdByCondominium');
    }

    /** @throws HttpUnprocessableEntityException */
    private function validatePersonData(array $data, ?string $normalizedCpf): void
    {
        if (empty($data['full_name'])) {
            throw new HttpUnprocessableEntityException('Full name is required');
        }

        if (empty($data['cpf'])) {
            throw new HttpUnprocessableEntityException('CPF is required');
        }

        if (empty($data['email'])) {
            throw new HttpUnprocessableEntityException('Email is required');
        }

        if (empty($data['birth_date'])) {
            throw new HttpUnprocessableEntityException('Birth date is required');
        }

        if (!$normalizedCpf || !$this->isValidCpf($normalizedCpf)) {
            throw new HttpUnprocessableEntityException('Invalid CPF');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpUnprocessableEntityException('Invalid email format');
        }

        if (!$this->isValidBirthDate($data['birth_date'])) {
            throw new HttpUnprocessableEntityException('Invalid birth date format. Use YYYY-MM-DD');
        }

        if (
            isset($data['created_by_condominium_id'])
            && !is_null($data['created_by_condominium_id'])
            && !is_numeric($data['created_by_condominium_id'])
        ) {
            throw new HttpUnprocessableEntityException('Created by condominium ID must be numeric');
        }
    }

    private function normalizeCpf(?string $cpf): ?string
    {
        if (is_null($cpf)) {
            return null;
        }

        return preg_replace('/\D/', '', $cpf);
    }

    private function isValidBirthDate(string $birthDate): bool
    {
        $date = DateTime::createFromFormat('Y-m-d', $birthDate);

        return $date && $date->format('Y-m-d') === $birthDate;
    }

    private function isValidCpf(string $cpf): bool
    {
        if (!preg_match('/^\d{11}$/', $cpf)) {
            return false;
        }

        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $sum = 0;

            for ($d = 0; $d < $t; $d++) {
                $sum += ((int)$cpf[$d]) * (($t + 1) - $d);
            }

            $digit = ((10 * $sum) % 11) % 10;

            if ((int)$cpf[$t] !== $digit) {
                return false;
            }
        }

        return true;
    }

    /** @throws HttpNotFoundException */
    private function validateCondominium(int $condominiumId): void
    {
        $this->condominiumService->find($condominiumId);
    }
}
