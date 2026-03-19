<?php

namespace App\Services;

use App\Models\AuditLog;
use DateTimeImmutable;

class AuditLogService
{
    /** @param array<string, mixed>|null $requestBody */
    public function register(
        string $method,
        string $path,
        ?string $queryString,
        ?string $ipAddress,
        ?string $userAgent,
        ?array $requestBody,
        int $responseStatus,
        int $durationMs
    ): void {
        $normalizedBody = $requestBody;

        if (is_array($normalizedBody) && isset($normalizedBody['password'])) {
            $normalizedBody['password'] = '***';
        }

        $requestBodyJson = is_array($normalizedBody)
            ? json_encode($normalizedBody, JSON_UNESCAPED_UNICODE)
            : null;

        if (is_string($requestBodyJson) && strlen($requestBodyJson) > 12000) {
            $requestBodyJson = substr($requestBodyJson, 0, 12000) . '...';
        }

        AuditLog::create([
            'method' => strtoupper($method),
            'path' => $path,
            'query_string' => $queryString,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'request_body' => $requestBodyJson,
            'response_status' => $responseStatus,
            'duration_ms' => $durationMs,
            'created_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s')
        ]);
    }

    public function list(int $limit = 500)
    {
        return AuditLog::query()
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    public function exportCsv(): string
    {
        $rows = AuditLog::query()
            ->orderByDesc('id')
            ->get([
                'id',
                'created_at',
                'method',
                'path',
                'query_string',
                'ip_address',
                'user_agent',
                'response_status',
                'duration_ms',
                'request_body'
            ]);

        $stream = fopen('php://temp', 'r+');

        fputcsv($stream, [
            'id',
            'created_at',
            'method',
            'path',
            'query_string',
            'ip_address',
            'user_agent',
            'response_status',
            'duration_ms',
            'request_body'
        ], ';', '"', '\\');

        foreach ($rows as $row) {
            fputcsv($stream, [
                $row->id,
                $row->created_at,
                $row->method,
                $row->path,
                $row->query_string,
                $row->ip_address,
                $row->user_agent,
                $row->response_status,
                $row->duration_ms,
                $row->request_body,
            ], ';', '"', '\\');
        }

        rewind($stream);

        $csv = stream_get_contents($stream);

        fclose($stream);

        return "\xEF\xBB\xBF" . ($csv ?: '');
    }
}
