<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    protected $table = 'sources';
    protected $fillable = ['url', 'source_type', 'publisher', 'usage_permission_status', 'last_accessed_at', 'notes'];
}
