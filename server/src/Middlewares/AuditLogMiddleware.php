<?php

namespace App\Middlewares;

use App\Services\AuditLogService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Throwable;

class AuditLogMiddleware implements MiddlewareInterface
{
    public function __construct(private AuditLogService $service) {}

    public function process(Request $request, RequestHandler $handler): Response
    {
        $start = hrtime(true);

        try {
            $response = $handler->handle($request);
        } catch (Throwable $exception) {
            $durationMs = $this->durationInMilliseconds($start);
            $this->safeRegister($request, 500, $durationMs);

            throw $exception;
        }

        $durationMs = $this->durationInMilliseconds($start);
        $this->safeRegister($request, $response->getStatusCode(), $durationMs);

        return $response;
    }

    private function safeRegister(Request $request, int $statusCode, int $durationMs): void
    {
        $path = $request->getUri()->getPath();

        if ($request->getMethod() === 'OPTIONS') {
            return;
        }

        if (str_starts_with($path, '/audit-logs')) {
            return;
        }

        try {
            $this->service->register(
                method: $request->getMethod(),
                path: $path,
                queryString: $request->getUri()->getQuery() ?: null,
                ipAddress: $this->resolveIpAddress($request),
                userAgent: $request->getHeaderLine('User-Agent') ?: null,
                requestBody: is_array($request->getParsedBody()) ? $request->getParsedBody() : null,
                responseStatus: $statusCode,
                durationMs: $durationMs
            );
        } catch (Throwable) {
            // Logging failure should never break API flow.
        }
    }

    private function resolveIpAddress(Request $request): ?string
    {
        $forwarded = $request->getHeaderLine('X-Forwarded-For');

        if ($forwarded !== '') {
            $parts = array_map('trim', explode(',', $forwarded));
            $firstIp = $parts[0] ?? null;

            if ($firstIp !== null && $firstIp !== '') {
                return $firstIp;
            }
        }

        $realIp = trim($request->getHeaderLine('X-Real-IP'));

        if ($realIp !== '') {
            return $realIp;
        }

        $serverParams = $request->getServerParams();

        return $serverParams['REMOTE_ADDR'] ?? null;
    }

    private function durationInMilliseconds(int $start): int
    {
        $elapsedNanoseconds = hrtime(true) - $start;

        return (int)round($elapsedNanoseconds / 1_000_000);
    }
}
