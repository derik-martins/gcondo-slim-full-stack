<?php

namespace App\Controllers;

use App\Http\Response\ResponseBuilder;
use App\Services\AuditLogService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuditLogController
{
    public function __construct(private AuditLogService $service) {}

    public function list(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) && is_numeric($params['limit'])
            ? max(1, min(5000, (int)$params['limit']))
            : 500;

        $data = ['audit_logs' => $this->service->list($limit)];

        return ResponseBuilder::respondWithData($response, data: $data);
    }

    public function exportCsv(Request $request, Response $response): Response
    {
        $csv = $this->service->exportCsv();
        $fileName = 'audit-logs-' . date('Ymd-His') . '.csv';

        $response->getBody()->write($csv);

        return $response
            ->withHeader('Content-Type', 'text/csv; charset=utf-8')
            ->withHeader('Content-Disposition', "attachment; filename=\"{$fileName}\"")
            ->withHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->withStatus(200);
    }
}
