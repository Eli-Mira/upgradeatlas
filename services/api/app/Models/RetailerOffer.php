<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RetailerOffer extends Model
{
    use HasFactory;

    protected $table = 'retailer_offers';
    protected $fillable = ['sku_id', 'retailer_id', 'retailer_sku', 'product_url', 'currency', 'displayed_price_egp', 'available_status', 'observed_at', 'recorded_at', 'source_id', 'active'];
    protected $casts = ['active' => 'boolean', 'displayed_price_egp' => 'decimal:2'];

    public function sku(): BelongsTo
    {
        return $this->belongsTo(LaptopSku::class, 'sku_id');
    }

    public function retailer(): BelongsTo
    {
        return $this->belongsTo(Retailer::class, 'retailer_id');
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class, 'source_id');
    }
}
