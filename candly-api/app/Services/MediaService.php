<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Profile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Store photo publicly so it can be displayed without authentication.
     */
    public function storeProfilePhoto(int $userId, UploadedFile $photo): string
    {
        $filename = $this->buildFilename($userId, $photo, ['jpg', 'jpeg', 'png']);

        return $photo->storeAs('profiles/photos', $filename, 'public');
    }

    /**
     * Store CV privately and only ever expose it via signed temporary URLs.
     */
    public function storeProfileCv(int $userId, UploadedFile $cv): string
    {
        $filename = $this->buildFilename($userId, $cv, ['pdf']);

        return $cv->storeAs('profiles/cvs', $filename, 'local');
    }

    /**
     * Update profile media atomically.
     *
     * Cleanup rule: update DB first; delete the old file only after a successful commit.
     */
    public function updateProfileMedia(Profile $profile, ?UploadedFile $photo, ?UploadedFile $cv): Profile
    {
        $newPhotoPath = $photo ? $this->storeProfilePhoto((int) $profile->user_id, $photo) : null;
        $newCvPath = $cv ? $this->storeProfileCv((int) $profile->user_id, $cv) : null;

        try {
            /** @var array{oldPhoto:?string,oldCv:?string} $old */
            $old = DB::transaction(function () use ($profile, $newPhotoPath, $newCvPath): array {
                $oldPhoto = $profile->photo_path;
                $oldCv = $profile->cv_path;

                if ($newPhotoPath !== null) {
                    $profile->photo_path = $newPhotoPath;
                }

                if ($newCvPath !== null) {
                    $profile->cv_path = $newCvPath;
                }

                $profile->save();

                DB::afterCommit(function () use ($oldPhoto, $oldCv, $newPhotoPath, $newCvPath): void {
                    // Delete old files only after the DB update is guaranteed persisted.
                    if ($newPhotoPath !== null && $oldPhoto) {
                        Storage::disk('public')->delete($oldPhoto);
                    }

                    if ($newCvPath !== null && $oldCv) {
                        Storage::disk('local')->delete($oldCv);
                    }
                });

                return ['oldPhoto' => $oldPhoto, 'oldCv' => $oldCv];
            });
        } catch (\Throwable $e) {
            // Rollback safety: keep the old file; remove newly stored files to avoid orphaned blobs.
            if ($newPhotoPath !== null) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            if ($newCvPath !== null) {
                Storage::disk('local')->delete($newCvPath);
            }

            throw $e;
        }

        return $profile->refresh();
    }

    /**
     * Filename format: {userId}_{timestamp}_{uuid}.{ext}
     */
    private function buildFilename(int $userId, UploadedFile $file, array $allowedExtensions): string
    {
        $timestamp = now()->format('YmdHis');
        $uuid = (string) Str::uuid();
        $ext = strtolower((string) ($file->extension() ?: 'bin'));
        if (! in_array($ext, $allowedExtensions, true)) {
            $ext = $allowedExtensions[0] ?? 'bin';
        }

        return "{$userId}_{$timestamp}_{$uuid}.{$ext}";
    }
}

