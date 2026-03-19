<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'full_name',
        'cpf',
        'email',
        'birth_date',
        'created_by_condominium_id'
    ];

    public function createdByCondominium()
    {
        return $this->belongsTo(Condominium::class, 'created_by_condominium_id');
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'person_supplier', 'person_id', 'supplier_id');
    }
}
