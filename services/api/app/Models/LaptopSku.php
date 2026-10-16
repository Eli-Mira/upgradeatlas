<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaptopSku extends Model
{
    protected $table = 'laptop_skus';
    protected $fillable = [
        'variant_id', 'manufacturer_part_number', 'display_name',
        'cpu_id', 'gpu_id', 'display_id', 'base_ram_gb', 'base_storage_gb', 'mass_g', 'status',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(LaptopVariant::class, 'variant_id');
    }

    public function cpu(): BelongsTo
    {
        return $this->belongsTo(Cpu::class, 'cpu_id');
    }

    public function gpu(): BelongsTo
    {
        return $this->belongsTo(Gpu::class, 'gpu_id');
    }

    public function display(): BelongsTo
    {
        return $this->belongsTo(Display::class, 'display_id');
    }

    public function ramConfiguration(): HasOne
    {
        return $this->hasOne(RamConfiguration::class, 'sku_id');
    }

    public function storageSlots(): HasMany
    {
        return $this->hasMany(StorageSlot::class, 'sku_id');
    }
}
