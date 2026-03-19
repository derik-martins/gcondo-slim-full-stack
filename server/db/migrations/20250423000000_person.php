<?php

use App\Helpers\PhinxHelper;
use Phinx\Migration\AbstractMigration;

class Person extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('people')
            ->addColumn('full_name', 'string', ['null' => false])
            ->addColumn('cpf', 'string', ['limit' => 11, 'null' => false])
            ->addColumn('email', 'string', ['null' => false])
            ->addColumn('birth_date', 'date', ['null' => false])
            ->addIndex('cpf', ['unique' => true]);

        PhinxHelper::setForeignColumn($table, 'created_by_condominium_id', 'condominiums', true);
        PhinxHelper::setDatetimeColumns($table);

        $table->create();
    }
}
