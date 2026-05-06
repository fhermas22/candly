<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileMediaController extends Controller
{
    /**
     * Serve a CV via a short-lived signed URL (private file).
     *
     * CVs must never be publicly accessible; signed URLs provide time-boxed access.
     */
    public function cv(Request $request, Profile $profile): StreamedResponse
    {
        abort_unless($request->hasValidSignature(), 403);

        abort_unless($profile->cv_path, 404);

        // Stream the file through the application to keep it off public storage.
        return response()->streamDownload(function () use ($profile): void {
            $stream = Storage::disk('local')->readStream($profile->cv_path);
            if (! is_resource($stream)) {
                return;
            }

            fpassthru($stream);
            fclose($stream);
        }, basename($profile->cv_path));
    }
}

