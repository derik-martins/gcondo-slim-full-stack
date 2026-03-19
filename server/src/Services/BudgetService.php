<?php

namespace App\Services;

use App\Http\Error\HttpNotFoundException;
use App\Http\Error\HttpUnprocessableEntityException;
use App\Models\Budget;

class BudgetService
{
    private const ALLOWED_CATEGORIES = [
        'Manutenção preventiva',
        'Manutenção corretiva',
        'Obra ou reforma',
        'Contratação recorrente',
        'Compra pontual'
    ];

    private const ALLOWED_STATUS = [
        'Rascunho',
        'Enviado',
        'Em análise',
        'Aprovado',
        'Reprovado',
        'Cancelado'
    ];

    public function __construct(
        protected SupplierService $supplierService,
        protected CondominiumService $condominiumService
    ) {}

    public function list()
    {
        return Budget::with(['supplier', 'condominium'])->get();
    }

    public function find(int $id): Budget
    {
        $budget = Budget::with(['supplier', 'condominium'])->find($id);

        if (!$budget) {
            throw new HttpNotFoundException('Budget not found');
        }

        return $budget;
    }

    public function create(array $data): Budget
    {
        $this->validateBudgetData($data);

        $this->validateSupplier((int)$data['supplier_id']);
        $this->validateCondominium((int)$data['condominium_id']);

        $budget = Budget::create([
            'supplier_id' => (int)$data['supplier_id'],
            'condominium_id' => (int)$data['condominium_id'],
            'title' => $data['title'],
            'service_description' => $data['service_description'],
            'value' => $data['value'],
            'category' => $data['category'],
            'status' => $data['status']
        ]);

        return $budget->load(['supplier', 'condominium']);
    }

    public function update(int $id, array $data): Budget
    {
        $budget = $this->find($id);

        $this->validateBudgetData($data);

        $this->validateSupplier((int)$data['supplier_id']);
        $this->validateCondominium((int)$data['condominium_id']);

        $budget->fill([
            'supplier_id' => (int)$data['supplier_id'],
            'condominium_id' => (int)$data['condominium_id'],
            'title' => $data['title'],
            'service_description' => $data['service_description'],
            'value' => $data['value'],
            'category' => $data['category'],
            'status' => $data['status']
        ]);

        $budget->save();

        return $budget->load(['supplier', 'condominium']);
    }

    public function delete(int $id): bool
    {
        $budget = $this->find($id);

        $deleted = $budget->delete();

        return $deleted;
    }

    /** @throws HttpUnprocessableEntityException */
    private function validateBudgetData(array $data): void
    {
        if (empty($data['supplier_id'])) {
            throw new HttpUnprocessableEntityException('Supplier ID is required');
        }

        if (empty($data['condominium_id'])) {
            throw new HttpUnprocessableEntityException('Condominium ID is required');
        }

        if (empty($data['title'])) {
            throw new HttpUnprocessableEntityException('Title is required');
        }

        if (empty($data['service_description'])) {
            throw new HttpUnprocessableEntityException('Service description is required');
        }

        if (!isset($data['value']) || $data['value'] === '') {
            throw new HttpUnprocessableEntityException('Value is required');
        }

        if (empty($data['category'])) {
            throw new HttpUnprocessableEntityException('Category is required');
        }

        if (empty($data['status'])) {
            throw new HttpUnprocessableEntityException('Status is required');
        }

        if (!is_numeric($data['supplier_id']) || (int)$data['supplier_id'] <= 0) {
            throw new HttpUnprocessableEntityException('Supplier ID must be a positive integer');
        }

        if (!is_numeric($data['condominium_id']) || (int)$data['condominium_id'] <= 0) {
            throw new HttpUnprocessableEntityException('Condominium ID must be a positive integer');
        }

        if (!is_numeric($data['value']) || (float)$data['value'] <= 0) {
            throw new HttpUnprocessableEntityException('Value must be a positive number');
        }

        if (!in_array($data['category'], self::ALLOWED_CATEGORIES, true)) {
            throw new HttpUnprocessableEntityException('Invalid category');
        }

        if (!in_array($data['status'], self::ALLOWED_STATUS, true)) {
            throw new HttpUnprocessableEntityException('Invalid status');
        }
    }

    /** @throws HttpNotFoundException */
    private function validateSupplier(int $supplierId): void
    {
        $this->supplierService->find($supplierId);
    }

    /** @throws HttpNotFoundException */
    private function validateCondominium(int $condominiumId): void
    {
        $this->condominiumService->find($condominiumId);
    }
}
