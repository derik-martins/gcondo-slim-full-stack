export namespace AuditLog {
    export type Model = {
        id: number,
        method: string,
        path: string,
        query_string: string | null,
        ip_address: string | null,
        user_agent: string | null,
        request_body: string | null,
        response_status: number,
        duration_ms: number,
        created_at: string,
    }
}
