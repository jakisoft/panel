<?php

namespace Pterodactyl\Providers;

use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * An array of configuration keys to override with database values
     * if they exist.
     */
    protected array $keys = [
        'app:name',
        'app:description',
        'app:logo',
        'app:logo_display',
        'app:favicon',
        'app:og_image',
        'app:locale',
        'recaptcha:enabled',
        'recaptcha:secret_key',
        'recaptcha:website_key',
        'pterodactyl:guzzle:timeout',
        'pterodactyl:guzzle:connect_timeout',
        'pterodactyl:console:count',
        'pterodactyl:console:frequency',
        'pterodactyl:auth:2fa_required',
        'pterodactyl:client_features:allocations:enabled',
        'pterodactyl:client_features:allocations:range_start',
        'pterodactyl:client_features:allocations:range_end',
        'backups:default_provider',
        'backups:r2:enabled',
        'backups:r2:account_id',
        'backups:r2:bucket',
        'backups:r2:access_key_id',
        'backups:r2:secret_access_key',
        'backups:r2:endpoint',
        'backups:gdrive:enabled',
        'backups:gdrive:client_id',
        'backups:gdrive:client_secret',
        'backups:gdrive:refresh_token',
        'backups:gdrive:folder_id',
        'backups:panel_auto_enabled',
        'backups:panel_auto_frequency',
        'backups:telegram:enabled',
        'backups:telegram:bot_token',
        'backups:telegram:owner_id',
        'backup:default_provider',
        'backup:r2:enabled',
        'backup:r2:account_id',
        'backup:r2:bucket',
        'backup:r2:access_key_id',
        'backup:r2:secret_access_key',
        'backup:r2:endpoint',
        'backup:gdrive:enabled',
        'backup:gdrive:client_id',
        'backup:gdrive:client_secret',
        'backup:gdrive:refresh_token',
        'backup:gdrive:folder_id',
        'backup:panel_auto_enabled',
        'backup:panel_auto_frequency',
        'backup:telegram:enabled',
        'backup:telegram:bot_token',
        'backup:telegram:owner_id',
        'cs:enabled',
        'cs:title',
        'cs:subtitle',
        'cs:whatsapp',
        'cs:telegram',
        'cs:discord',
        'cs:email',
        'footer:social_enabled',
        'footer:github',
        'footer:tiktok',
        'footer:instagram',
    ];

    /**
     * Keys specific to the mail driver that are only grabbed from the database
     * when using the SMTP driver.
     */
    protected array $emailKeys = [
        'mail:mailers:smtp:host',
        'mail:mailers:smtp:port',
        'mail:mailers:smtp:encryption',
        'mail:mailers:smtp:username',
        'mail:mailers:smtp:password',
        'mail:from:address',
        'mail:from:name',
    ];

    /**
     * Keys that are encrypted and should be decrypted when set in the
     * configuration array.
     */
    protected static array $encrypted = [
        'mail:mailers:smtp:password',
    ];

    /**
     * Boot the service provider.
     */
    public function boot(ConfigRepository $config, Log $log, SettingsRepositoryInterface $settings): void
    {
        // Only set the email driver settings from the database if we
        // are configured using SMTP as the driver.
        if ($config->get('mail.default') === 'smtp') {
            $this->keys = array_merge($this->keys, $this->emailKeys);
        }

        try {
            $values = $settings->all()->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->value];
            })->toArray();
        } catch (QueryException $exception) {
            $log->notice('A query exception was encountered while trying to load settings from the database: ' . $exception->getMessage());

            return;
        }

        $encrypter = null;
        if (!empty($config->get('app.key'))) {
            try {
                $encrypter = $this->app->make(Encrypter::class);
            } catch (\Exception $e) {
            }
        }

        foreach ($this->keys as $key) {
            $altKey = str_starts_with($key, 'backups:')
                ? 'backup:' . substr($key, 8)
                : (str_starts_with($key, 'backup:') ? 'backups:' . substr($key, 7) : $key);

            $value = array_get($values, 'settings::' . $key, array_get($values, 'settings::' . $altKey, $config->get(str_replace(':', '.', $key))));
            if (in_array($key, self::$encrypted) && $encrypter) {
                try {
                    $value = $encrypter->decrypt($value);
                } catch (DecryptException $exception) {
                }
            }

            switch (strtolower((string) $value)) {
                case 'true':
                case '(true)':
                    $value = true;
                    break;
                case 'false':
                case '(false)':
                    $value = false;
                    break;
                case 'empty':
                case '(empty)':
                    $value = '';
                    break;
                case 'null':
                case '(null)':
                    $value = null;
            }

            $config->set(str_replace(':', '.', $key), $value);
            if (str_starts_with($key, 'backups:')) {
                $config->set('backup.' . substr(str_replace(':', '.', $key), 8), $value);
            } elseif (str_starts_with($key, 'backup:')) {
                $config->set('backups.' . substr(str_replace(':', '.', $key), 7), $value);
            }
        }
    }

    public static function getEncryptedKeys(): array
    {
        return self::$encrypted;
    }
}
