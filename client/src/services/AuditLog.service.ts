import type { ListAuditLogs } from './contracts/AuditLog.contract';
import { BASE_URL, Request } from './Request';

export const listAuditLogs = (limit = 500): Promise<ListAuditLogs.Response> => Request.get(`/audit-logs?limit=${limit}`);
export const exportAuditLogsUrl = (): string => `${BASE_URL}/audit-logs/export`;
