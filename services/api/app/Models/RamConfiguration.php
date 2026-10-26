<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RamConfiguration extends Model
{
    protected $table = 'ram_configurations';
    protected $fillable = ['sku_id', 'soldered_gb', 'slot_count', 'occupied_slot_count', 'standard', 'documented_max_gb', 'max_meaning', 'disassembly_risk_notes', 'warranty_notes', 'evidence_id'];
    public $timestamps = true;

    public function sku(): BelongsTo
    {
        return $this->belongsTo(LaptopSku::class, 'sku_id');
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(Evidence::class, 'evidence_id');
    }
}
