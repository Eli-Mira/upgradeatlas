<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Gpu extends Model
{
    use HasFactory;
    protected $table = 'gpus';
    protected $fillable = ['maker', 'model', 'vram_gb', 'tgp_w'];
}
