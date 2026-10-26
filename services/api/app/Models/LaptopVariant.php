<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LaptopVariant extends Model
{
    use HasFactory;
    protected $table = 'laptop_variants';
    protected $fillable = ['family_id', 'manufacturer_model_code', 'region_code', 'notes'];

    public function family(): BelongsTo
    {
        return $this->belongsTo(LaptopFamily::class, 'family_id');
    }

    public function skus(): HasMany
    {
        return $this->hasMany(LaptopSku::class, 'variant_id');
    }
}
