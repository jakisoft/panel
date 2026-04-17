<?php

namespace Pterodactyl\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\User;
use Pterodactyl\Services\Users\UserCreationService;

class RegisterController extends AbstractLoginController
{
    /**
     * Handle a registration request to the application.
     */
    public function register(Request $request, UserCreationService $creator): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'between:1,191', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'between:1,191', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var User $user */
        $user = $creator->handle([
            'username' => mb_strtolower($data['username']),
            'email' => mb_strtolower($data['email']),
            'name_first' => $data['username'],
            'name_last' => 'User',
            'password' => $data['password'],
        ]);

        return $this->sendLoginResponse($user, $request);
    }
}
