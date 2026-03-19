<?php

namespace App\Services;

use App\Http\Error\HttpBadRequestException;
use App\Http\Error\HttpConflictException;
use App\Http\Error\HttpExternalServiceUnavailableException;
use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Person;
use App\Models\Supplier;
use Illuminate\Database\Capsule\Manager as Capsule;

class SupplierService
{
    private const ALLOWED_CATEGORIES = [
        'Manutenção predial',
        'Limpeza e conservação',
        'Segurança e portaria',
        'Elétrica e hidráulica',
        'Obras e reformas',
        'Administrativo e outros'
    ];

    public function list()
    {
        return Supplier::with('people')->get();
    }

    public function find(int $id): Supplier
    {
        $supplier = Supplier::with('people')->find($id);

        if (!$supplier) {
            throw new HttpNotFoundException('Supplier not found');
        }

        return $supplier;
    }

    public function create(array $data): Supplier
    {
        $normalizedCnpj = $this->normalizeCnpj($data['cnpj'] ?? null);

        $this->validateSupplierData($data, $normalizedCnpj);

        if (Supplier::where('cnpj', $normalizedCnpj)->exists()) {
            throw new HttpConflictException('CNPJ already exists');
        }

        $personIds = $this->extractPersonIds($data['person_ids'] ?? null);
        $this->validatePeopleExist($personIds);

        $supplier = Capsule::connection()->transaction(function () use ($data, $normalizedCnpj, $personIds) {
            $supplier = Supplier::create([
                'legal_name' => $data['legal_name'],
                'trade_name' => $data['trade_name'],
                'cnpj' => $normalizedCnpj,
                'email' => $data['email'],
                'zip_code' => $this->normalizeZipCode($data['zip_code']),
                'address' => $data['address'],
                'category' => $data['category']
            ]);

            $supplier->people()->sync($personIds);

            return $supplier;
        });

        return $supplier->load('people');
    }

    public function update(int $id, array $data): Supplier
    {
        $supplier = $this->find($id);

        $normalizedCnpj = $this->normalizeCnpj($data['cnpj'] ?? null);
        $this->validateSupplierData($data, $normalizedCnpj);

        if (
            Supplier::where('cnpj', $normalizedCnpj)
                ->where('id', '!=', $supplier->id)
                ->exists()
        ) {
            throw new HttpConflictException('CNPJ already exists');
        }

        $personIds = $this->extractPersonIds($data['person_ids'] ?? null);
        $this->validatePeopleExist($personIds);

        $updated = Capsule::connection()->transaction(function () use ($supplier, $data, $normalizedCnpj, $personIds) {
            $supplier->fill([
                'legal_name' => $data['legal_name'],
                'trade_name' => $data['trade_name'],
                'cnpj' => $normalizedCnpj,
                'email' => $data['email'],
                'zip_code' => $this->normalizeZipCode($data['zip_code']),
                'address' => $data['address'],
                'category' => $data['category']
            ]);

            $supplier->save();
            $supplier->people()->sync($personIds);

            return $supplier;
        });

        return $updated->load('people');
    }

    public function delete(int $id): bool
    {
        $supplier = $this->find($id);

        if ($supplier->budgets()->count() > 0) {
            throw new HttpBadRequestException('Cannot delete supplier with budgets');
        }

        $supplier->people()->detach();

        $deleted = $supplier->delete();

        return $deleted;
    }

    /** @return array<string, mixed> */
    public function lookupByCnpj(string $cnpj): array
    {
        $normalizedCnpj = $this->normalizeCnpj($cnpj);

        if (!$normalizedCnpj || !$this->isValidCnpj($normalizedCnpj)) {
            throw new HttpUnprocessableEntityException('Invalid CNPJ');
        }

        $providers = [
            [
                'name' => 'receitaws',
                'url' => "https://www.receitaws.com.br/v1/cnpj/{$normalizedCnpj}"
            ],
            [
                'name' => 'brasilapi',
                'url' => "https://brasilapi.com.br/api/cnpj/v1/{$normalizedCnpj}"
            ]
        ];

        $hasNotFound = false;
        $hasNetworkFailure = false;
        $hasUnavailable = false;

        foreach ($providers as $provider) {
            $httpResponse = $this->requestJson($provider['url']);

            if ($httpResponse['network_error']) {
                $hasNetworkFailure = true;
                continue;
            }

            $result = match ($provider['name']) {
                'receitaws' => $this->mapReceitaWsResult($httpResponse, $normalizedCnpj),
                'brasilapi' => $this->mapBrasilApiResult($httpResponse, $normalizedCnpj),
                default => ['status' => 'unavailable']
            };

            if ($result['status'] === 'success') {
                return [
                    'provider' => $provider['name'],
                    'supplier' => $result['supplier']
                ];
            }

            if ($result['status'] === 'not_found') {
                $hasNotFound = true;
                continue;
            }

            $hasUnavailable = true;
        }

        if ($hasNotFound && !$hasNetworkFailure && !$hasUnavailable) {
            throw new HttpNotFoundException('Supplier not found for the provided CNPJ');
        }

        throw new HttpExternalServiceUnavailableException(
            'Unable to query CNPJ at the moment. Please try again.'
        );
    }

    /** @throws HttpUnprocessableEntityException */
    private function validateSupplierData(array $data, ?string $normalizedCnpj): void
    {
        if (empty($data['legal_name'])) {
            throw new HttpUnprocessableEntityException('Legal name is required');
        }

        if (empty($data['trade_name'])) {
            throw new HttpUnprocessableEntityException('Trade name is required');
        }

        if (empty($data['cnpj'])) {
            throw new HttpUnprocessableEntityException('CNPJ is required');
        }

        if (empty($data['email'])) {
            throw new HttpUnprocessableEntityException('Email is required');
        }

        if (empty($data['zip_code'])) {
            throw new HttpUnprocessableEntityException('Zip code is required');
        }

        if (empty($data['address'])) {
            throw new HttpUnprocessableEntityException('Address is required');
        }

        if (empty($data['category'])) {
            throw new HttpUnprocessableEntityException('Category is required');
        }

        if (empty($data['person_ids'])) {
            throw new HttpUnprocessableEntityException('At least one person is required');
        }

        if (!$normalizedCnpj || !$this->isValidCnpj($normalizedCnpj)) {
            throw new HttpUnprocessableEntityException('Invalid CNPJ');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new HttpUnprocessableEntityException('Invalid email format');
        }

        if (!$this->isValidZipCode($data['zip_code'])) {
            throw new HttpUnprocessableEntityException('Invalid ZIP code format');
        }

        if (!in_array($data['category'], self::ALLOWED_CATEGORIES, true)) {
            throw new HttpUnprocessableEntityException('Invalid category');
        }

        if (!is_array($data['person_ids'])) {
            throw new HttpUnprocessableEntityException('Person IDs must be an array');
        }
    }

    /** @throws HttpUnprocessableEntityException */
    private function extractPersonIds(mixed $personIds): array
    {
        if (!is_array($personIds)) {
            throw new HttpUnprocessableEntityException('Person IDs must be an array');
        }

        if (count($personIds) < 1) {
            throw new HttpUnprocessableEntityException('At least one person is required');
        }

        $normalized = [];

        foreach ($personIds as $personId) {
            if (!is_numeric($personId) || (int)$personId <= 0) {
                throw new HttpUnprocessableEntityException('Person IDs must contain only positive integers');
            }

            $normalized[] = (int)$personId;
        }

        $unique = array_values(array_unique($normalized));

        if (count($unique) !== count($normalized)) {
            throw new HttpUnprocessableEntityException('Person IDs cannot contain duplicates');
        }

        return $unique;
    }

    /** @throws HttpUnprocessableEntityException */
    private function validatePeopleExist(array $personIds): void
    {
        $count = Person::whereIn('id', $personIds)->count();

        if ($count !== count($personIds)) {
            throw new HttpUnprocessableEntityException('One or more people were not found');
        }
    }

    private function normalizeCnpj(?string $cnpj): ?string
    {
        if (is_null($cnpj)) {
            return null;
        }

        return preg_replace('/\D/', '', $cnpj);
    }

    private function normalizeZipCode(string $zipCode): string
    {
        return preg_replace('/\D/', '', $zipCode);
    }

    private function isValidZipCode(string $zipCode): bool
    {
        return preg_match('/^\d{5}-?\d{3}$/', $zipCode) === 1;
    }

    private function isValidCnpj(string $cnpj): bool
    {
        if (!preg_match('/^\d{14}$/', $cnpj)) {
            return false;
        }

        if (preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }

        $weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $weightsSecond = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        $firstDigit = $this->calculateCnpjDigit($cnpj, $weightsFirst);
        $secondDigit = $this->calculateCnpjDigit($cnpj, $weightsSecond);

        return (int)$cnpj[12] === $firstDigit && (int)$cnpj[13] === $secondDigit;
    }

    private function calculateCnpjDigit(string $cnpj, array $weights): int
    {
        $sum = 0;

        foreach ($weights as $index => $weight) {
            $sum += ((int)$cnpj[$index]) * $weight;
        }

        $remainder = $sum % 11;

        return $remainder < 2 ? 0 : 11 - $remainder;
    }

    /** @return array{status_code:?int, body:?array<string, mixed>, network_error:bool} */
    private function requestJson(string $url): array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 8,
                'ignore_errors' => true,
                'header' => implode("\r\n", [
                    'Accept: application/json',
                    'User-Agent: Gcondo/1.0',
                ])
            ]
        ]);

        $rawBody = @file_get_contents($url, false, $context);
        $headers = $http_response_header ?? [];
        $statusCode = $this->extractStatusCodeFromHeaders($headers);

        if ($rawBody === false) {
            return [
                'status_code' => $statusCode,
                'body' => null,
                'network_error' => true
            ];
        }

        $decoded = json_decode($rawBody, true);

        return [
            'status_code' => $statusCode,
            'body' => is_array($decoded) ? $decoded : null,
            'network_error' => false
        ];
    }

    private function extractStatusCodeFromHeaders(array $headers): ?int
    {
        if (!isset($headers[0])) {
            return null;
        }

        if (preg_match('/\s(\d{3})\s/', $headers[0], $matches) !== 1) {
            return null;
        }

        return (int)$matches[1];
    }

    /** @param array{status_code:?int, body:?array<string, mixed>, network_error:bool} $httpResponse */
    private function mapReceitaWsResult(array $httpResponse, string $normalizedCnpj): array
    {
        $statusCode = $httpResponse['status_code'];
        $body = $httpResponse['body'] ?? [];

        if (($statusCode && $statusCode >= 500) || $statusCode === 429) {
            return ['status' => 'unavailable'];
        }

        if (empty($body) || !isset($body['status'])) {
            return ['status' => 'unavailable'];
        }

        if ($body['status'] !== 'OK') {
            $message = strtolower(trim((string)($body['message'] ?? '')));

            if (str_contains($message, 'cnpj inválido') || str_contains($message, 'cnpj invalido')) {
                return ['status' => 'invalid'];
            }

            if (
                str_contains($message, 'não foi encontrado')
                || str_contains($message, 'nao foi encontrado')
            ) {
                return ['status' => 'not_found'];
            }

            return ['status' => 'unavailable'];
        }

        return [
            'status' => 'success',
            'supplier' => [
                'cnpj' => $normalizedCnpj,
                'legal_name' => (string)($body['nome'] ?? ''),
                'trade_name' => (string)($body['fantasia'] ?? ''),
                'email' => (string)($body['email'] ?? ''),
                'zip_code' => $this->normalizeZipCode((string)($body['cep'] ?? '')),
                'address' => $this->buildAddress(
                    logradouro: (string)($body['logradouro'] ?? ''),
                    numero: (string)($body['numero'] ?? ''),
                    complemento: (string)($body['complemento'] ?? ''),
                    bairro: (string)($body['bairro'] ?? ''),
                    municipio: (string)($body['municipio'] ?? ''),
                    uf: (string)($body['uf'] ?? '')
                )
            ]
        ];
    }

    /** @param array{status_code:?int, body:?array<string, mixed>, network_error:bool} $httpResponse */
    private function mapBrasilApiResult(array $httpResponse, string $normalizedCnpj): array
    {
        $statusCode = $httpResponse['status_code'];
        $body = $httpResponse['body'] ?? [];

        if ($statusCode === 404) {
            return ['status' => 'not_found'];
        }

        if ($statusCode === 400 || $statusCode === 422) {
            return ['status' => 'invalid'];
        }

        if (($statusCode && $statusCode >= 500) || $statusCode === 429) {
            return ['status' => 'unavailable'];
        }

        if (empty($body) || empty($body['razao_social'])) {
            return ['status' => 'unavailable'];
        }

        return [
            'status' => 'success',
            'supplier' => [
                'cnpj' => $normalizedCnpj,
                'legal_name' => (string)($body['razao_social'] ?? ''),
                'trade_name' => (string)($body['nome_fantasia'] ?? ''),
                'email' => (string)($body['email'] ?? ''),
                'zip_code' => $this->normalizeZipCode((string)($body['cep'] ?? '')),
                'address' => $this->buildAddress(
                    logradouro: (string)($body['logradouro'] ?? ''),
                    numero: (string)($body['numero'] ?? ''),
                    complemento: (string)($body['complemento'] ?? ''),
                    bairro: (string)($body['bairro'] ?? ''),
                    municipio: (string)($body['municipio'] ?? ''),
                    uf: (string)($body['uf'] ?? '')
                )
            ]
        ];
    }

    private function buildAddress(
        string $logradouro,
        string $numero,
        string $complemento,
        string $bairro,
        string $municipio,
        string $uf
    ): string {
        $parts = array_filter([
            trim($logradouro),
            trim($numero),
            trim($complemento),
            trim($bairro),
            trim($municipio),
            trim($uf)
        ], fn($value) => $value !== '');

        return implode(', ', $parts);
    }
}
