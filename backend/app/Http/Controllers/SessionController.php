<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Revoke all tokens for the authenticated user except the current one.
     *
     * This allows users to explicitly log out other devices/sessions
     * without losing their own session.
     */
    public function revokeOthers(Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $user->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();

        return response()->json([
            'message' => 'Other sessions revoked.',
        ]);
    }
}
