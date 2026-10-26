<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Display extends Model
{
    use HasFactory;
    protected $table = 'displays';
    protected $fillable = ['diagonal_inches', 'resolution_width', 'resolution_height', 'refresh_hz', 'panel_type', 'color_gamut', 'brightness_nits'];
}
