<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'supplier_id',
        'condominium_id',
        'title',
        'service_description',
        'value',
        'category',
        'status'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }
}
