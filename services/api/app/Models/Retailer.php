<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Retailer extends Model
{
    protected $table = 'retailers';
    protected $fillable = ['name', 'website_url', 'country', 'status'];

    public function offers(): HasMany
    {
        return $this->hasMany(RetailerOffer::class, 'retailer_id');
    }
}
