<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Tests\Support\TestDatabaseManager;

/**
 * Ensures bootstrap.php required vars are present for test runs.
 */
function setTestEnv(string $key, string $value): void
{
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

setTestEnv('DATABASE_DRIVER', 'mysql');
setTestEnv('DATABASE_HOST', 'database');
setTestEnv('DATABASE_PORT', '3306');
setTestEnv('DATABASE_NAME', 'gcondo_slim_test');
setTestEnv('DATABASE_USERNAME', 'root');
setTestEnv('DATABASE_PASSWORD', 'gcondo');
setTestEnv('CORS_ALLOWED_ORIGIN', 'http://localhost:5100');

TestDatabaseManager::ensureDatabaseExists();

$app = require __DIR__ . '/../public/index.php';

$GLOBALS['app'] = $app;

TestDatabaseManager::resetSchema();
