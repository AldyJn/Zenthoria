protected $middlewareGroups = [
    'web' => [
        // ... otros middleware
        \App\Http\Middleware\HandleInertiaRequests::class,
    ],
];
