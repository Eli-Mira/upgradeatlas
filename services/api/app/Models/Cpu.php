<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cpu extends Model
{
    use HasFactory;
    protected $table = 'cpus';
    protected $fillable = ['maker', 'model', 'architecture', 'cores', 'threads', 'tdp_w'];
}
