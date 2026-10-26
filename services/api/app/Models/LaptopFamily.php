<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LaptopFamily extends Model
{
    use HasFactory;
    protected $table = 'laptop_families';
    protected $fillable = ['brand_id', 'family_name', 'slug', 'launch_year'];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(LaptopVariant::class, 'family_id');
    }
}
