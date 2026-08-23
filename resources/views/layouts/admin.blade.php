<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'JKSoft Cloud') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">
        <meta name="robots" content="index, follow">

        <!-- Primary Meta Tags -->
        <meta name="title" content="{{ config('app.name', 'JKSoft Cloud') }} - Admin Control Panel">
        <meta name="description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
        <meta name="keywords" content="jksoft, jksoft cloud, cloud panel, game server manager, pterodactyl, docker, game hosting, server management, minecraft hosting, vps panel, cloud console, high performance">
        <meta name="author" content="{{ config('app.name', 'JKSoft Cloud') }}">

        <!-- Open Graph / Facebook / Discord / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:site_name" content="{{ config('app.name', 'JKSoft Cloud') }}">
        <meta property="og:title" content="{{ config('app.name', 'JKSoft Cloud') }} - Admin Control Panel">
        <meta property="og:description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
        <meta property="og:image" content="{{ url(config('app.og_image', '/og-image.svg')) }}">
        <meta property="og:image:secure_url" content="{{ url(config('app.og_image', '/og-image.svg')) }}">
        <meta property="og:image:type" content="image/svg+xml">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="500">
        <meta property="og:image:alt" content="{{ config('app.name', 'JKSoft Cloud') }} Banner">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">

        <!-- Twitter / X Cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ config('app.name', 'JKSoft Cloud') }} - Admin Control Panel">
        <meta name="twitter:description" content="{{ config('app.description', 'JKSoft Cloud Panel - Next-Gen Game Server & Cloud Management Platform with High-Performance Docker Isolation, Real-Time Console, and Automated Backups.') }}">
        <meta name="twitter:image" content="{{ url(config('app.og_image', '/og-image.svg')) }}">
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

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
            <style>
                .skin-blue .main-header {
                    height: 58px;
                    max-height: 58px;
                    z-index: 1030;
                }
                .skin-blue .main-header .navbar {
                    margin-left: 0 !important;
                    width: 100% !important;
                    min-height: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .skin-blue .main-header .navbar .sidebar-toggle {
                    height: 58px;
                    width: 50px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    float: left;
                    font-size: 16px;
                }
                .admin-navbar-brand {
                    float: left;
                    display: flex;
                    align-items: center;
                    height: 58px;
                    padding: 0 16px;
                    gap: 12px;
                    text-decoration: none;
                    color: #ffffff;
                    transition: opacity 0.2s ease;
                }
                .admin-navbar-brand:hover, .admin-navbar-brand:focus {
                    opacity: 0.9;
                    text-decoration: none;
                    color: #ffffff;
                }
                .skin-blue .main-header .navbar .navbar-custom-menu {
                    height: 58px;
                }
                .skin-blue .main-header .navbar .navbar-custom-menu .navbar-nav {
                    display: flex;
                    align-items: center;
                    height: 58px;
                }
                .skin-blue .main-header .navbar .navbar-custom-menu .navbar-nav > li > a {
                    height: 58px;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    font-size: 14px;
                }
                .skin-blue .main-header .navbar .navbar-custom-menu .user-menu .user-image {
                    width: 32px;
                    height: 32px;
                    margin-top: 0;
                    margin-right: 10px;
                    border-radius: 50%;
                }
                /* Snug, proportional and clean layout metrics */
                .skin-blue.fixed .main-sidebar {
                    padding-top: 58px !important;
                }
                .skin-blue.fixed .content-wrapper {
                    padding-top: 58px !important;
                }
                .content-header {
                    padding: 16px 20px 0 20px !important;
                }
                .content {
                    padding: 16px 20px 24px 20px !important;
                }
                .sidebar-menu > li.header {
                    padding: 12px 18px 6px 18px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }
                .sidebar-menu > li > a {
                    padding: 11px 18px;
                    font-size: 13.5px;
                }
                .sidebar-menu > li > a > .fa {
                    width: 20px;
                    font-size: 14px;
                }
            </style>
        @show
    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            <header class="main-header">
                <nav class="navbar navbar-static-top" role="navigation">
                    <div style="display: flex; align-items: center; float: left; height: 58px;">
                        <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </a>
                        <a href="{{ route('index') }}" class="admin-navbar-brand">
                            <img src="{{ config('app.favicon', '/assets/svgs/jksoft-icon.svg') }}" alt="Logo" style="height: 32px; width: 32px; object-fit: contain; border-radius: 8px; flex-shrink: 0;">
                            <span style="font-weight: 800; font-size: 17px; color: #ffffff; letter-spacing: -0.02em; white-space: nowrap;">{{ config('app.name', 'JKSoft Cloud') }}</span>
                        </a>
                    </div>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}">
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="User Image">
                                    <span class="hidden-xs" style="font-weight: 600;">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control" style="font-size: 16px;"><i class="fa fa-server"></i></a>
                            </li>
                            <li>
                                <a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout" style="font-size: 16px;"><i class="fa fa-sign-out"></i></a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        <li class="header">BASIC ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i class="fa fa-home"></i> <span>Overview</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-wrench"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.backup') ?: 'active' }}">
                            <a href="{{ route('admin.backup')}}">
                                <i class="fa fa-cloud-upload"></i> <span>Cloud Backup</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-gamepad"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header">MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i class="fa fa-database"></i> <span>Databases</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i class="fa fa-globe"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i class="fa fa-sitemap"></i> <span>Nodes</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i class="fa fa-server"></i> <span>Servers</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i class="fa fa-users"></i> <span>Users</span>
                            </a>
                        </li>
                        <li class="header">SERVICE MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i class="fa fa-magic"></i> <span>Mounts</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i class="fa fa-th-large"></i> <span>Nests</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {{ $message }}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right small text-gray" style="margin-right:10px;margin-top:-7px;">
                    <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong> {{ $appVersion }}<br />
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
                </div>
                Copyright &copy; 2015 - {{ date('Y') }} <a href="{{ config('app.footer_url', 'https://github.com/jakisoft/panel') }}" target="_blank" rel="noopener noreferrer">{{ config('app.name', 'JKSoft Cloud') }}</a>. All rights reserved.
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>
