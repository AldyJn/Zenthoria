<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', config('app.name', 'EduApp Gamificada'))</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=roboto:400,500,600&display=swap" rel="stylesheet" />
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Material Design Icons -->
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .auth-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .logo-emblem {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fff, #f8f9fa);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #667eea;
            font-size: 2.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .card {
            border-radius: 15px;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            padding: 12px 24px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .form-control-lg {
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }

        .form-control-lg:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .text-white-50 {
            color: rgba(255, 255, 255, 0.7) !important;
        }

        .input-group .btn {
            border: 2px solid #e9ecef;
            border-left: none;
        }

        .form-check-input:checked {
            background-color: #667eea;
            border-color: #667eea;
        }

        .alert {
            border-radius: 8px;
            border: none;
        }

        .invalid-feedback {
            font-size: 0.875rem;
        }

        .card.bg-primary {
            background: linear-gradient(135deg, #667eea, #5a67d8) !important;
        }

        .card.bg-success {
            background: linear-gradient(135deg, #48bb78, #38a169) !important;
        }

        .card.bg-warning {
            background: linear-gradient(135deg, #ed8936, #dd6b20) !important;
        }

        .display-6 {
            font-size: 2rem;
        }

        @media (max-width: 768px) {
            .logo-emblem {
                width: 60px;
                height: 60px;
                font-size: 2rem;
            }
            
            .display-6 {
                font-size: 1.5rem;
            }
            
            .h4 {
                font-size: 1.1rem;
            }
        }
    </style>
    
    @stack('styles')
</head>
<body>
    @yield('content')

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    @stack('scripts')
</body>
</html>