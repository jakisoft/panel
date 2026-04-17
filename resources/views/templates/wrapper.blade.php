<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
            
            <?php
            $elysium = \Illuminate\Support\Facades\DB::table('elysium')->first();
            ?>

            <meta property="og:type" content="website" />
            <meta property="og:title" content="<?php echo $elysium->title ?>">
            <meta property="og:image" content="<?php echo $elysium->logo ?>"/>
            <meta property="og:description" content="<?php echo $elysium->description ?>" />
            <link rel="icon" type="image/png" href="<?php echo $elysium->logo ?>" sizes="16x16">
            <link rel="icon" type="image/png" href="<?php echo $elysium->logo ?>" sizes="32x32">
            <link rel="shortcut icon" href="<?php echo $elysium->logo ?>">
            <meta name="theme-color" content="<?php echo $elysium->color_meta; ?>">
            
            <style>
                :root{
                    --logo:<?php echo json_encode($elysium->logo) ?>;
                    --server-background:<?php echo json_encode($elysium->server_background) ?>;

                    --copyright-by:<?php echo json_encode($elysium->copyright_by) ?>;
                    --copyright-link:<?php echo json_encode($elysium->copyright_link) ?>;
                    --copyright-start-year:<?php echo json_encode($elysium->copyright_start_year) ?>;

                    --announcement-type:<?php echo $elysium->announcement_type; ?>;
                    --announcement-message:<?php echo json_encode($elysium->announcement_message) ?>;
                    --announcement-closable:<?php echo $elysium->announcement_closable; ?>;
                    --announcement-color-information:<?php echo $elysium->color_information ?>;
                    --announcement-color-update:<?php echo $elysium->color_update ?>;
                    --announcement-color-warning:<?php echo $elysium->color_warning ?>;
                    --announcement-color-error:<?php echo $elysium->color_error ?>;

                    --color-console:<?php echo $elysium->color_console; ?>;
                    --color-editor:<?php echo $elysium->color_editor; ?>;
                    --color-1:<?php echo $elysium->color_1; ?>;
                    --color-2:<?php echo $elysium->color_2; ?>;
                    --color-3:<?php echo $elysium->color_3; ?>;
                    --color-4:<?php echo $elysium->color_4; ?>;
                    --color-5:<?php echo $elysium->color_5; ?>;
                    --color-green:<?php echo $elysium->color_6; ?>;
                    --color-yellow:<?php echo $elysium->color_7; ?>;
                    --color-red:<?php echo $elysium->color_8; ?>;
                }
            </style>

            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">

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
        <style>
            @import url('//fonts.googleapis.com/css?family=Rubik:300,400,500&display=swap');
            @import url('//fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:500&display=swap');
        </style>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
    </body>
</html>

{{-- //ELYSIUM --}}