<?php
// app/Http/Controllers/TestController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TestController extends Controller
{
    public function test()
    {
        return Inertia::render('Test', [
            'message' => 'Si ves esto, Inertia está funcionando correctamente',
            'data' => [
                'timestamp' => now()->format('Y-m-d H:i:s'),
                'user_agent' => request()->userAgent(),
            ]
        ]);
    }
}