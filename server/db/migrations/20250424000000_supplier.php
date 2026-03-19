<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Supplier extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('suppliers')
            ->addColumn('legal_name', 'string', ['null' => false])
            ->addColumn('trade_name', 'string', ['null' => false])
            ->addColumn('cnpj', 'string', ['limit' => 14, 'null' => false])
            ->addColumn('email', 'string', ['null' => false])
            ->addColumn('zip_code', 'string', ['limit' => 8, 'null' => false])
            ->addColumn('address', 'string', ['null' => false])
            ->addColumn('category', 'string', ['null' => false])
            ->addIndex('cnpj', ['unique' => true]);

        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
