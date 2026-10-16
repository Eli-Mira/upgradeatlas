<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Display extends Model
{
    protected $table = 'displays';
    protected $fillable = ['diagonal_inches', 'resolution_width', 'resolution_height', 'refresh_hz', 'panel_type', 'color_gamut', 'brightness_nits'];
}
