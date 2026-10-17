<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        $connection = $app->make('db')->connection();
        if (! $app->environment('testing')
            || $connection->getDriverName() !== 'pgsql'
            || $connection->getDatabaseName() !== 'upgradeatlas_test') {
            throw new \RuntimeException('Refusing tests outside PostgreSQL upgradeatlas_test.');
        }

        return $app;
    }
}
