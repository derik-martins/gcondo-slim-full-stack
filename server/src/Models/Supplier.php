<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'legal_name',
        'trade_name',
        'cnpj',
        'email',
        'zip_code',
        'address',
        'category'
    ];

    public function people()
    {
        return $this->belongsToMany(Person::class, 'person_supplier', 'supplier_id', 'person_id');
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
}
