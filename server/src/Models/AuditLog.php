<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $table = 'audit_logs';

    protected $fillable = [
        'method',
        'path',
        'query_string',
        'ip_address',
        'user_agent',
        'request_body',
        'response_status',
        'duration_ms',
        'created_at'
    ];
}
