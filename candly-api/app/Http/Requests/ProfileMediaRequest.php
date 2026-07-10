<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for profile media uploads.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Lenient file type detection: we still enforce that the uploaded file
            // is an actual image/PDF, but we do not rely exclusively on the browser
            // Content-Type header.
            'photo' => [
                'nullable',
                'file',
                // Ensure it can be parsed as an image by PHP/GD.
                'image',
                // Accept both by extension and by detected mime.
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
            'cv' => [
                'nullable',
                'file',
                'mimetypes:application/pdf',
                'mimes:pdf',
                'max:5120',
            ],
        ];
    }


    public function messages(): array
    {
        return [
            'photo.file' => 'La photo doit être un fichier valide.',
            'photo.mimes' => 'La photo doit être au format JPG, PNG ou WebP.',
            'photo.max' => 'La photo ne doit pas dépasser 2MB.',
            'cv.file' => 'Le CV doit être un fichier valide.',
            'cv.mimes' => 'Le CV doit être au format PDF.',
            'cv.max' => 'Le CV ne doit pas dépasser 5MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure at least one file is provided
        if (!$this->hasFile('photo') && !$this->hasFile('cv')) {
            $this->merge([
                '_has_files' => false,
            ]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->hasFile('photo') && !$this->hasFile('cv')) {
                $validator->errors()->add('files', 'Vous devez télécharger au moins une photo ou un CV.');
                return;
            }

            if (! $validator->errors()->isEmpty()) {
                // Targeted logging for 422 validation failures to debug MIME/type issues.
                // Logged only when validation is already failing.
                try {
                    $photo = $this->file('photo');
                    $cv = $this->file('cv');

                    $payload = [
                        'route' => $this->path(),
                        'user_id' => $this->user()?->id,
                        'photo' => $photo ? [
                            'original_name' => $photo->getClientOriginalName(),
                            'client_mime' => $photo->getClientMimeType(),
                            'extension' => $photo->getClientOriginalExtension(),
                            'guess_extension' => $photo->guessExtension(),
                            'size_bytes' => $photo->getSize(),
                        ] : null,
                        'cv' => $cv ? [
                            'original_name' => $cv->getClientOriginalName(),
                            'client_mime' => $cv->getClientMimeType(),
                            'extension' => $cv->getClientOriginalExtension(),
                            'guess_extension' => $cv->guessExtension(),
                            'size_bytes' => $cv->getSize(),
                        ] : null,
                        'validation_errors' => $validator->errors()->toArray(),
                    ];

                    logger()->warning('[ProfileMediaRequest] Upload validation failed', $payload);
                } catch (\Throwable) {
                    // Never break request because of logging.
                }
            }
        });
    }

}

