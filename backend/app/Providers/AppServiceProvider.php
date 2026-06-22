<?php

namespace App\Providers;

use App\Services\GeoProviderInterface;
use App\Services\IpApiProvider;
use App\Services\KnownServicesWhitelist;
use App\Services\Resolver;
use App\Services\ResolverInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ResolverInterface::class, Resolver::class);
        $this->app->bind(GeoProviderInterface::class, IpApiProvider::class);
        $this->app->singleton(KnownServicesWhitelist::class);
    }

    public function boot(): void
    {
        //
    }
}
