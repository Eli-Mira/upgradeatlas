<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageSlot extends Model
{
    protected $table = 'storage_slots';
    protected $fillable = ['sku_id', 'slot_index', 'form_factor', 'protocol', 'pcie_generation', 'occupied_status', 'constraints_text', 'evidence_id'];

    public function sku(): BelongsTo
    {
        return $this->belongsTo(LaptopSku::class, 'sku_id');
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(Evidence::class, 'evidence_id');
    }
}
