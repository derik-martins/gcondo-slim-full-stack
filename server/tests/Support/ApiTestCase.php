<?php

declare(strict_types=1);

namespace Tests\Support;

use PHPUnit\Framework\TestCase;
use Slim\App;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\StreamFactory;

abstract class ApiTestCase extends TestCase
{
    protected App $app;

    protected function setUp(): void
    {
        parent::setUp();

        TestDatabaseManager::resetSchema();

        /** @var App $app */
        $app = $GLOBALS['app'];
        $this->app = $app;
    }

    /**
     * @param array<string, mixed>|null $body
     * @return array{http_status:int,payload:?array<string,mixed>,raw:string}
     */
    protected function request(string $method, string $path, ?array $body = null): array
    {
        $requestFactory = new ServerRequestFactory();
        $streamFactory = new StreamFactory();

        $request = $requestFactory->createServerRequest($method, $path)
            ->withHeader('Accept', 'application/json')
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('User-Agent', 'PHPUnit');

        if ($body !== null) {
            $jsonBody = json_encode($body, JSON_THROW_ON_ERROR);
            $request = $request
                ->withBody($streamFactory->createStream($jsonBody))
                ->withParsedBody($body);
        }

        $response = $this->app->handle($request);
        $raw = (string)$response->getBody();
        $payload = $raw !== '' ? json_decode($raw, true) : null;

        return [
            'http_status' => $response->getStatusCode(),
            'payload' => $payload,
            'raw' => $raw,
        ];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    protected function createCondominium(array $overrides = []): int
    {
        $response = $this->request('POST', '/condominiums', array_merge([
            'name' => 'Condominio Teste',
            'zip_code' => '12345678',
            'url' => 'https://condo-' . uniqid() . '.test',
        ], $overrides));

        $this->assertNotNull($response['payload']);

        return (int)$response['payload']['data']['condominium']['id'];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    protected function createPerson(array $overrides = []): int
    {
        $response = $this->request('POST', '/people', array_merge([
            'full_name' => 'Pessoa Teste',
            'cpf' => '52998224725',
            'email' => 'pessoa@teste.com',
            'birth_date' => '1990-01-01',
            'created_by_condominium_id' => null,
        ], $overrides));

        $this->assertNotNull($response['payload']);

        return (int)$response['payload']['data']['person']['id'];
    }

    /**
     * @param array<string, mixed> $overrides
     */
    protected function createSupplier(int $personId, array $overrides = []): int
    {
        $response = $this->request('POST', '/suppliers', array_merge([
            'legal_name' => 'Fornecedor LTDA',
            'trade_name' => 'Fornecedor Teste',
            'cnpj' => '11444777000161',
            'email' => 'fornecedor@teste.com',
            'zip_code' => '12345-678',
            'address' => 'Rua Teste, 123',
            'category' => 'Manutenção predial',
            'person_ids' => [$personId],
        ], $overrides));

        $this->assertNotNull($response['payload']);

        return (int)$response['payload']['data']['supplier']['id'];
    }
}
