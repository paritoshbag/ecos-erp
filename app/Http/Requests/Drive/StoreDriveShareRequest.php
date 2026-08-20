<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDriveShareRequest extends FormRequest
{
    public function authorize(): bool
    {
        $item = $this->routeItem();

        return $item !== null && $this->user()->can('share', $item);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'exists:users,email',
                Rule::notIn([$this->user()->email]),
            ],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $item = $this->routeItem();
                $grantee = $this->grantee();

                if ($item === null || $grantee === null) {
                    return;
                }

                if ($grantee->id === $item->user_id) {
                    $validator->errors()->add('email', 'The owner already has full access.');
                }
            },
        ];
    }

    public function grantee(): ?User
    {
        $email = $this->input('email');

        if (! is_string($email) || $email === '') {
            return null;
        }

        return User::query()->where('email', $email)->first();
    }

    public function routeItem(): ?DriveItem
    {
        $item = $this->route('item');

        return $item instanceof DriveItem ? $item : null;
    }
}
