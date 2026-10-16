<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cpu extends Model
{
    protected $table = 'cpus';
    protected $fillable = ['maker', 'model', 'architecture', 'cores', 'threads', 'tdp_w'];
}
