<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Budget extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('budgets')
            ->addColumn('title', 'string', ['null' => false])
            ->addColumn('service_description', 'text', ['null' => false])
            ->addColumn('value', 'decimal', ['precision' => 12, 'scale' => 2, 'null' => false])
            ->addColumn('category', 'string', ['null' => false])
            ->addColumn('status', 'string', ['null' => false]);

        PhinxHelper::setForeignColumn($table, 'supplier_id', 'suppliers');
        PhinxHelper::setForeignColumn($table, 'condominium_id', 'condominiums');
        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
