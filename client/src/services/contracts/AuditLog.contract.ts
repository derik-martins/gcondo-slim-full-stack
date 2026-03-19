import type { AuditLog } from '@internal-types/AuditLog.type';
import type { Service } from '@internal-types/Service.type';

export namespace ListAuditLogs {
    type Data = { audit_logs: AuditLog.Model[] };

    export type Response =
        | Service.DefaultResponse<Data>
        | Service.ExceptionResponse;
}
