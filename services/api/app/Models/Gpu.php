<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gpu extends Model
{
    protected $table = 'gpus';
    protected $fillable = ['maker', 'model', 'vram_gb', 'tgp_w'];
}
