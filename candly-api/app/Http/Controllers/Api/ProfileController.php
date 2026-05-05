<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileMediaRequest;
use App\Http\Resources\UserResource;
use App\Models\Profile;
use App\Services\MediaService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly MediaService $media)
    {
    }

    /**
     * Upload/update profile media (photo and/or CV).
     */
    public function uploadMedia(ProfileMediaRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            throw new AuthorizationException();
        }

        $profile = Profile::query()->firstOrCreate(
            ['user_id' => (int) $user->id],
            ['first_name' => '','last_name' => '']
        );

        $photo = $request->file('photo');
        $cv = $request->file('cv');

        $this->media->updateProfileMedia($profile, $photo, $cv);

        return response()->json(new UserResource($user->load('profile')), 200);
    }
}

