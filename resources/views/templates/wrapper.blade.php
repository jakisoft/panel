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
            
            
            <?php
            $elysium = \Illuminate\Support\Facades\DB::table('elysium')->first();
            ?>

            @php
                $favicon = !empty($elysium->logo) ? $elysium->logo : '/favicons/favicon.ico';
            @endphp

            <link rel="apple-touch-icon" sizes="180x180" href="{{ $favicon }}">
            <link rel="icon" type="image/png" href="{{ $favicon }}" sizes="16x16">
            <link rel="icon" type="image/png" href="{{ $favicon }}" sizes="32x32">
            <link rel="shortcut icon" href="{{ $favicon }}">

            <meta property="og:type" content="website" />
            <meta property="og:title" content="<?php echo $elysium->title ?>">
            <meta property="og:image" content="<?php echo $elysium->logo ?>"/>
            <meta property="og:description" content="<?php echo $elysium->description ?>" />
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
                    --auth-input-text-color:<?php echo $elysium->color_auth_input_text ?? '#F8FAFC'; ?>;
                    --auth-input-placeholder-color:<?php echo $elysium->color_auth_input_placeholder ?? '#94A3B8'; ?>;
                    --auth-label-text-color:<?php echo $elysium->color_auth_label_text ?? '#9CA3AF'; ?>;
                    --oauth-google-enabled:<?php echo !empty($elysium->google_auth_enabled) ? '1' : '0'; ?>;
                    --oauth-github-enabled:<?php echo !empty($elysium->github_auth_enabled) ? '1' : '0'; ?>;
                    --playground-badge:<?php echo json_encode($elysium->playground_badge ?? 'Pterodactyl + Elysium Theme') ?>;
                    --playground-brand-name:<?php echo json_encode($elysium->playground_brand_name ?? 'Elysium Panel') ?>;
                    --playground-brand-icon:<?php echo json_encode($elysium->playground_brand_icon ?? 'Server') ?>;
                    --playground-hero-title:<?php echo json_encode($elysium->playground_hero_title ?? 'Kelola Server Lebih Cepat dan Modern.') ?>;
                    --playground-hero-description:<?php echo json_encode($elysium->playground_hero_description ?? 'Halaman playground untuk eksplorasi fitur panel, status server, keamanan akun, dan pembaruan Elysium Theme.') ?>;
                    --playground-pricing-title:<?php echo json_encode($elysium->playground_pricing_title ?? 'Paket Pricing Panel') ?>;
                    --playground-pricing-subtitle:<?php echo json_encode($elysium->playground_pricing_subtitle ?? 'Ringkasan paket server yang tersedia untuk kebutuhan komunitas hingga bisnis.') ?>;
                    --playground-faq-badge:<?php echo json_encode($elysium->playground_faq_badge ?? 'Pusat Bantuan') ?>;
                    --playground-faq-title:<?php echo json_encode($elysium->playground_faq_title ?? 'Pertanyaan Populer') ?>;
                    --playground-faq-subtitle:<?php echo json_encode($elysium->playground_faq_subtitle ?? '') ?>;
                    --playground-pricing-items:<?php echo json_encode($elysium->playground_pricing_items ?? '[]') ?>;
                    --playground-faq-items:<?php echo json_encode($elysium->playground_faq_items ?? '[]') ?>;
                    --playground-visual-cards:<?php echo json_encode($elysium->playground_visual_cards ?? '[]') ?>;
                    --playground-footer-links:<?php echo json_encode($elysium->playground_footer_links ?? '[]') ?>;
                    --playground-social-links:<?php echo json_encode($elysium->playground_social_links ?? '[]') ?>;
                }
            </style>


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