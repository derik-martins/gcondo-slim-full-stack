<?php

use Phinx\Migration\AbstractMigration;

class AuditLog extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('audit_logs')
            ->addColumn('method', 'string', ['limit' => 10, 'null' => false])
            ->addColumn('path', 'string', ['null' => false])
            ->addColumn('query_string', 'text', ['null' => true])
            ->addColumn('ip_address', 'string', ['limit' => 45, 'null' => true])
            ->addColumn('user_agent', 'string', ['null' => true])
            ->addColumn('request_body', 'text', ['null' => true])
            ->addColumn('response_status', 'integer', ['null' => false])
            ->addColumn('duration_ms', 'integer', ['null' => false])
            ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'null' => false]);

        $table
            ->addIndex(['method'])
            ->addIndex(['path'])
            ->addIndex(['response_status'])
            ->addIndex(['created_at'])
            ->create();
    }
}
