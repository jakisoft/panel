<?php

namespace Pterodactyl\Http\Controllers\Auth;

use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\User;

class SocialAuthController extends AbstractLoginController
{
    public function redirectToGoogle(): RedirectResponse
    {
        $config = $this->getProviderConfig('google');
        $this->assertProviderEnabled('google', $config);

        $query = http_build_query([
            'client_id' => $config['client_id'],
            'redirect_uri' => $config['callback_url'],
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        $config = $this->getProviderConfig('google');
        $this->assertProviderEnabled('google', $config);

        $code = $request->query('code');
        if (!$code) {
            return redirect('/auth/login')->withErrors(['social' => 'Google callback is missing the authorization code.']);
        }

        try {
            $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $config['callback_url'],
            ])->throw()->json();

            $accessToken = $tokenResponse['access_token'] ?? null;
            if (!$accessToken) {
                throw new Exception('No access token returned by Google.');
            }

            $profile = Http::withToken($accessToken)
                ->get('https://openidconnect.googleapis.com/v1/userinfo')
                ->throw()
                ->json();

            $email = $profile['email'] ?? null;
            if (!$email) {
                throw new Exception('Google account does not provide an email.');
            }

            return $this->loginExistingUserByEmail($email, $request);
        } catch (Exception $exception) {
            return redirect('/auth/login')->withErrors(['social' => 'Google login failed: ' . $exception->getMessage()]);
        }
    }

    public function redirectToGithub(): RedirectResponse
    {
        $config = $this->getProviderConfig('github');
        $this->assertProviderEnabled('github', $config);

        $query = http_build_query([
            'client_id' => $config['client_id'],
            'redirect_uri' => $config['callback_url'],
            'scope' => 'read:user user:email',
        ]);

        return redirect()->away('https://github.com/login/oauth/authorize?' . $query);
    }

    public function handleGithubCallback(Request $request): RedirectResponse
    {
        $config = $this->getProviderConfig('github');
        $this->assertProviderEnabled('github', $config);

        $code = $request->query('code');
        if (!$code) {
            return redirect('/auth/login')->withErrors(['social' => 'GitHub callback is missing the authorization code.']);
        }

        try {
            $tokenResponse = Http::asForm()
                ->withHeaders(['Accept' => 'application/json'])
                ->post('https://github.com/login/oauth/access_token', [
                    'client_id' => $config['client_id'],
                    'client_secret' => $config['client_secret'],
                    'code' => $code,
                    'redirect_uri' => $config['callback_url'],
                ])
                ->throw()
                ->json();

            $accessToken = $tokenResponse['access_token'] ?? null;
            if (!$accessToken) {
                throw new Exception('No access token returned by GitHub.');
            }

            $emails = Http::withToken($accessToken)
                ->withHeaders(['Accept' => 'application/vnd.github+json'])
                ->get('https://api.github.com/user/emails')
                ->throw()
                ->json();

            $primaryEmail = collect($emails)
                ->first(fn ($email) => ($email['primary'] ?? false) && ($email['verified'] ?? false));

            $email = $primaryEmail['email'] ?? null;
            if (!$email) {
                throw new Exception('GitHub account does not have a verified primary email.');
            }

            return $this->loginExistingUserByEmail($email, $request);
        } catch (Exception $exception) {
            return redirect('/auth/login')->withErrors(['social' => 'GitHub login failed: ' . $exception->getMessage()]);
        }
    }

    private function loginExistingUserByEmail(string $email, Request $request): RedirectResponse
    {
        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if (!$user) {
            return redirect('/auth/login')->withErrors([
                'social' => 'Social login gagal. Email akun social kamu belum terdaftar di panel.',
            ]);
        }

        $request->session()->regenerate();
        $this->auth->guard()->login($user, true);

        return redirect('/');
    }

    private function getProviderConfig(string $provider): array
    {
        $elysium = DB::table('elysium')->first();

        return [
            'enabled' => (bool) ($elysium->{$provider . '_auth_enabled'} ?? false),
            'client_id' => $elysium->{$provider . '_client_id'} ?? null,
            'client_secret' => $elysium->{$provider . '_client_secret'} ?? null,
            'callback_url' => $elysium->{$provider . '_callback_url'} ?? url('/auth/' . $provider . '/callback'),
        ];
    }

    private function assertProviderEnabled(string $provider, array $config): void
    {
        if (!$config['enabled'] || !$config['client_id'] || !$config['client_secret']) {
            abort(404, ucfirst($provider) . ' OAuth belum diaktifkan atau belum lengkap.');
        }
    }
}
