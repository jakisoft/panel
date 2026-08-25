<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;

class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(private AssetHashService $assetHashService)
    {
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'JKSoft Cloud',
            'logo' => config('app.logo') ?? '/assets/svgs/jksoft-logo.svg',
            'logo_display' => config('app.logo_display') ?? 'both',
            'favicon' => config('app.favicon') ?? '/assets/svgs/jksoft-icon.svg',
            'footer_url' => config('app.footer_url') ?? 'https://github.com/jakisoft/panel',
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'cs_contact' => [
                'enabled' => filter_var(config('cs.enabled', true), FILTER_VALIDATE_BOOLEAN),
                'title' => config('cs.title', 'Customer Support'),
                'subtitle' => config('cs.subtitle', 'Butuh bantuan? Hubungi tim support kami'),
                'whatsapp' => config('cs.whatsapp', ''),
                'telegram' => config('cs.telegram', ''),
                'discord' => config('cs.discord', ''),
                'email' => config('cs.email', ''),
            ],
            'social_links' => [
                'enabled' => filter_var(config('footer.social_enabled', true), FILTER_VALIDATE_BOOLEAN),
                'github' => config('footer.github', 'https://github.com/jakisoft/panel'),
                'tiktok' => config('footer.tiktok', ''),
                'instagram' => config('footer.instagram', ''),
            ],
        ]);
    }
}
