<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompatibilityAssertion extends Model
{
    protected $table = 'compatibility_assertions';

    protected $fillable = [
        'sku_id', 'component_class_id', 'outcome', 'reason', 'scope_notes',
        'confidence_level', 'evidence_id', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function sku(): BelongsTo
    {
        return $this->belongsTo(LaptopSku::class, 'sku_id');
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(Evidence::class, 'evidence_id');
    }
}
