<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComponentClass extends Model
{
    /** @use HasFactory<\Database\Factories\ComponentClassFactory> */
    use HasFactory;

    protected $table = 'component_classes';

    protected $fillable = [
        'component_type', 'standard', 'form_factor', 'protocol', 'capacity_gb', 'attributes',
    ];

    protected $casts = [
        'attributes' => 'json',
    ];

    public function assertions(): HasMany
    {
        return $this->hasMany(CompatibilityAssertion::class, 'component_class_id');
    }
}
