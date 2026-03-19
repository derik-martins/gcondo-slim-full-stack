<?php

declare(strict_types=1);

namespace Tests\Support;

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Schema\Blueprint;
use PDO;

final class TestDatabaseManager
{
    public static function ensureDatabaseExists(): void
    {
        $host = (string)($_ENV['DATABASE_HOST'] ?? 'database');
        $port = (string)($_ENV['DATABASE_PORT'] ?? '3306');
        $database = (string)($_ENV['DATABASE_NAME'] ?? 'gcondo_slim_test');
        $username = (string)($_ENV['DATABASE_USERNAME'] ?? 'root');
        $password = (string)($_ENV['DATABASE_PASSWORD'] ?? '');

        $pdo = new PDO(
            "mysql:host={$host};port={$port};charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]
        );

        $pdo->exec(
            "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );
    }

    public static function resetSchema(): void
    {
        Capsule::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach ([
            'audit_logs',
            'budgets',
            'person_supplier',
            'suppliers',
            'people',
            'units',
            'condominiums',
        ] as $table) {
            Capsule::schema()->dropIfExists($table);
        }

        Capsule::statement('SET FOREIGN_KEY_CHECKS=1');

        self::createSchema();
    }

    private static function createSchema(): void
    {
        $schema = Capsule::schema();

        $schema->create('condominiums', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('name');
            $table->string('zip_code', 8);
            $table->string('url')->unique();
            $table->timestamps();
        });

        $schema->create('units', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('name');
            $table->float('square_meters');
            $table->integer('bedroom_count');
            $table->unsignedInteger('condominium_id');
            $table->timestamps();

            $table->foreign('condominium_id')->references('id')->on('condominiums');
        });

        $schema->create('people', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('full_name');
            $table->string('cpf', 11)->unique();
            $table->string('email');
            $table->date('birth_date');
            $table->unsignedInteger('created_by_condominium_id')->nullable();
            $table->timestamps();

            $table->foreign('created_by_condominium_id')->references('id')->on('condominiums');
        });

        $schema->create('suppliers', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('legal_name');
            $table->string('trade_name');
            $table->string('cnpj', 14)->unique();
            $table->string('email');
            $table->string('zip_code', 8);
            $table->string('address');
            $table->string('category');
            $table->timestamps();
        });

        $schema->create('person_supplier', function (Blueprint $table): void {
            $table->unsignedInteger('person_id');
            $table->unsignedInteger('supplier_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['person_id', 'supplier_id']);

            $table->foreign('person_id')->references('id')->on('people');
            $table->foreign('supplier_id')->references('id')->on('suppliers');
        });

        $schema->create('budgets', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('title');
            $table->text('service_description');
            $table->decimal('value', 12, 2);
            $table->string('category');
            $table->string('status');
            $table->unsignedInteger('supplier_id');
            $table->unsignedInteger('condominium_id');
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers');
            $table->foreign('condominium_id')->references('id')->on('condominiums');
        });

        $schema->create('audit_logs', function (Blueprint $table): void {
            $table->increments('id');
            $table->string('method', 10);
            $table->string('path');
            $table->text('query_string')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->text('request_body')->nullable();
            $table->integer('response_status');
            $table->integer('duration_ms');
            $table->dateTime('created_at')->useCurrent();

            $table->index('method');
            $table->index('path');
            $table->index('response_status');
            $table->index('created_at');
        });
    }
}
