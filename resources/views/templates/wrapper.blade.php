<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'JKSoft Cloud') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="index, follow">

            <!-- Primary Meta Tags -->
            <meta name="title" content="{{ config('app.name', 'JKSoft Cloud') }} - Game Server & Cloud Platform">
            <meta name="description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
            <meta name="keywords" content="jksoft, jksoft cloud, cloud panel, game server manager, pterodactyl, docker, game hosting, server management, minecraft hosting, vps panel, cloud console, high performance">
            <meta name="author" content="{{ config('app.name', 'JKSoft Cloud') }}">

            <!-- Open Graph / Facebook / Discord / WhatsApp -->
            <meta property="og:type" content="website">
            <meta property="og:url" content="{{ url()->current() }}">
            <meta property="og:site_name" content="{{ config('app.name', 'JKSoft Cloud') }}">
            <meta property="og:title" content="{{ config('app.name', 'JKSoft Cloud') }} - Game Server & Cloud Platform">
            <meta property="og:description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
            <meta property="og:image" content="{{ asset(config('app.og_image', '/assets/svgs/og-image.svg')) }}">
            <meta property="og:image:secure_url" content="{{ asset(config('app.og_image', '/assets/svgs/og-image.svg')) }}">
            <meta property="og:image:type" content="image/svg+xml">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="500">
            <meta property="og:image:alt" content="{{ config('app.name', 'JKSoft Cloud') }} Banner">
            <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">

            <!-- Twitter / X Cards -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:url" content="{{ url()->current() }}">
            <meta name="twitter:title" content="{{ config('app.name', 'JKSoft Cloud') }} - Game Server & Cloud Platform">
            <meta name="twitter:description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
            <meta name="twitter:image" content="{{ asset(config('app.og_image', '/assets/svgs/og-image.svg')) }}">
            <meta name="twitter:image:alt" content="{{ config('app.name', 'JKSoft Cloud') }} Banner">

            <!-- Favicons & Icons -->
            <link rel="apple-touch-icon" sizes="180x180" href="{{ config('app.favicon', '/assets/svgs/jksoft-icon.svg') }}">
            <link rel="icon" type="image/svg+xml" href="{{ config('app.favicon', '/assets/svgs/jksoft-icon.svg') }}">
            <link rel="shortcut icon" href="{{ config('app.favicon', '/assets/svgs/jksoft-icon.svg') }}">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#0e4688">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            <meta name="msapplication-TileColor" content="#0e4688">
            <meta name="theme-color" content="#0e4688">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-950' }}">
        @section('content')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
    </body>
</html>
