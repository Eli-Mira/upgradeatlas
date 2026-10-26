<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laptop_skus', function (Blueprint $table) {
            $table->string('use_case', 64)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('laptop_skus', function (Blueprint $table) {
            $table->dropColumn('use_case');
        });
    }
};
