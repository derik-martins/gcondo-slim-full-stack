<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class PersonSupplier extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('person_supplier');

        PhinxHelper::setForeignColumn($table, 'person_id', 'people');
        PhinxHelper::setForeignColumn($table, 'supplier_id', 'suppliers');

        $table
            ->addIndex(['person_id', 'supplier_id'], ['unique' => true])
            ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->create();
    }
}
