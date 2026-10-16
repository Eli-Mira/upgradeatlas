<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DbConnectivityTest extends TestCase
{
    public function test_database_connection(): void
    {
        $result = DB::select('SELECT 1 AS ok');
        $this->assertSame(1, (int) $result[0]->ok);
    }
}
