<?php

namespace Tests\Feature;

use Tests\TestCase;

class LaptopApiTest extends TestCase
{
    public function test_laptops_index_is_ok(): void
    {
        $response = $this->get('/api/v1/laptops');
        $response->assertOk();
        $response->assertJsonStructure(['data', 'total', 'current_page']);
    }

    public function test_laptop_show_unknown_returns_not_found(): void
    {
        $this->get('/api/v1/laptops/does-not-exist')->assertNotFound();
    }
}
