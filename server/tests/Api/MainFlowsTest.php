<?php

declare(strict_types=1);

namespace Tests\Api;

use Tests\Support\ApiTestCase;

final class MainFlowsTest extends ApiTestCase
{
    public function testCreatesPersonSuccessfully(): void
    {
        $response = $this->request('POST', '/people', [
            'full_name' => 'Maria da Silva',
            'cpf' => '529.982.247-25',
            'email' => 'maria@teste.com',
            'birth_date' => '1992-08-10',
            'created_by_condominium_id' => null,
        ]);

        $this->assertNotNull($response['payload']);
        $this->assertSame(201, $response['payload']['statusCode']);
        $this->assertSame('Maria da Silva', $response['payload']['data']['person']['full_name']);
        $this->assertSame('52998224725', $response['payload']['data']['person']['cpf']);
    }

    public function testBlocksDuplicateCpf(): void
    {
        $this->request('POST', '/people', [
            'full_name' => 'Pessoa Base',
            'cpf' => '52998224725',
            'email' => 'base@teste.com',
            'birth_date' => '1990-01-01',
        ]);

        $response = $this->request('POST', '/people', [
            'full_name' => 'Pessoa Duplicada',
            'cpf' => '529.982.247-25',
            'email' => 'duplicada@teste.com',
            'birth_date' => '1991-02-02',
        ]);

        $this->assertNotNull($response['payload']);
        $this->assertSame(409, $response['http_status']);
        $this->assertSame(409, $response['payload']['statusCode']);
        $this->assertSame('CPF already exists', $response['payload']['error']['description']);
    }

    public function testCreatesSupplierLinkedToPerson(): void
    {
        $personId = $this->createPerson();

        $response = $this->request('POST', '/suppliers', [
            'legal_name' => 'Fornecedor Exemplo LTDA',
            'trade_name' => 'Fornecedor Exemplo',
            'cnpj' => '11.444.777/0001-61',
            'email' => 'fornecedor.exemplo@teste.com',
            'zip_code' => '12345-678',
            'address' => 'Rua Principal, 100',
            'category' => 'Manutenção predial',
            'person_ids' => [$personId],
        ]);

        $this->assertNotNull($response['payload']);
        $this->assertSame(201, $response['payload']['statusCode']);
        $this->assertSame('11444777000161', $response['payload']['data']['supplier']['cnpj']);
        $this->assertSame($personId, $response['payload']['data']['supplier']['people'][0]['id']);
    }

    public function testCreatesBudgetWithValidSupplierAndCondominium(): void
    {
        $condominiumId = $this->createCondominium();
        $personId = $this->createPerson();
        $supplierId = $this->createSupplier($personId);

        $response = $this->request('POST', '/budgets', [
            'supplier_id' => $supplierId,
            'condominium_id' => $condominiumId,
            'title' => 'Pintura externa',
            'service_description' => 'Pintura das fachadas laterais',
            'value' => 7800.50,
            'category' => 'Manutenção preventiva',
            'status' => 'Enviado',
        ]);

        $this->assertNotNull($response['payload']);
        $this->assertSame(201, $response['payload']['statusCode']);
        $this->assertSame($supplierId, $response['payload']['data']['budget']['supplier_id']);
        $this->assertSame($condominiumId, $response['payload']['data']['budget']['condominium_id']);
    }

    public function testFailsWhenBudgetHasInvalidSupplierLink(): void
    {
        $condominiumId = $this->createCondominium();

        $response = $this->request('POST', '/budgets', [
            'supplier_id' => 999999,
            'condominium_id' => $condominiumId,
            'title' => 'Orcamento invalido',
            'service_description' => 'Servico de teste',
            'value' => 1000,
            'category' => 'Manutenção preventiva',
            'status' => 'Enviado',
        ]);

        $this->assertNotNull($response['payload']);
        $this->assertSame(404, $response['http_status']);
        $this->assertSame(404, $response['payload']['statusCode']);
        $this->assertSame('Supplier not found', $response['payload']['error']['description']);
    }
}
