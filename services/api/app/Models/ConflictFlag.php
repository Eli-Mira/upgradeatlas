<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConflictFlag extends Model
{
    protected $table = 'conflict_flags';

    protected $fillable = [
        'entity_type', 'entity_id', 'field_name', 'evidence_ids',
        'status', 'resolution_notes', 'resolved_by',
    ];

    /** Open flags block publication of the affected entity. */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}
