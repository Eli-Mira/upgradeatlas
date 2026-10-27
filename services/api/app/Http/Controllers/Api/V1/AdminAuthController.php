<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:128'],
        ]);

        $user = User::where('email', $data['email'])->first();

        // One generic message for unknown email and wrong password: no
        // account enumeration.
        if (! $user || ! $user->hashed_password || ! Hash::check($data['password'], $user->getAuthPassword())) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (! $user->hasStaffRole()) {
            return response()->json(['message' => 'Forbidden: admin or editor role required.'], 403);
        }

        $token = $user->createToken($data['device_name'] ?? 'admin-api');

        // Token lifecycle is a security-relevant mutation: audit it like
        // every other administrative change (no secret material in the
        // audit payload — the token id only).
        Audit::record($user->id, 'personal_access_tokens', $token->accessToken->id, 'token_issue', null, [
            'user_id' => $user->id,
            'device_name' => $data['device_name'] ?? 'admin-api',
        ]);

        return response()->json([
            'token' => $token->plainTextToken,
            'role' => $user->role,
            'display_name' => $user->display_name,
        ], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $accessToken = $request->user()->currentAccessToken();
        $tokenId = $accessToken?->id;
        $accessToken?->delete();

        if ($tokenId !== null) {
            Audit::record($request->user()->id, 'personal_access_tokens', $tokenId, 'token_revoke', null, [
                'user_id' => $request->user()->id,
            ]);
        }

        return response()->json(['message' => 'Token revoked.']);
    }
}
