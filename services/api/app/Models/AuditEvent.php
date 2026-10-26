<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditEvent extends Model
{
    protected $table = 'audit_events';

    public $timestamps = false;

    protected $fillable = [
        'actor_id', 'entity_name', 'entity_pk', 'operation', 'old_value', 'new_value', 'occurred_at',
    ];

    protected $casts = [
        'old_value' => 'json',
        'new_value' => 'json',
        'occurred_at' => 'datetime',
    ];

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
