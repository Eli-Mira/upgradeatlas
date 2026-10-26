<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evidence extends Model
{
    protected $table = 'evidence';

    protected $fillable = [
        'source_id', 'locator', 'concise_paraphrase', 'fact_scope',
        'observed_at', 'verification_status', 'reviewer_id', 'superseded_by',
    ];

    protected $casts = [
        'observed_at' => 'datetime',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class, 'source_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
