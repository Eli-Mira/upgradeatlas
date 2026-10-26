<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;
    protected $table = 'brands';
    protected $fillable = ['name', 'slug'];

    public function families(): HasMany
    {
        return $this->hasMany(LaptopFamily::class, 'brand_id');
    }
}
