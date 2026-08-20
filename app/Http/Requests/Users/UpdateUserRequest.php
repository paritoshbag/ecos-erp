<?php

namespace App\Http\Requests\Users;

use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateUserRequest extends FormRequest
{
    use ProfileValidationRules;

    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user instanceof User
            && ($this->user()?->can('update', $user) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return $this->profileRules($user instanceof User ? $user->id : null);
    }

    protected function prepareForValidation(): void
    {
        if ($this->exists('email') && is_string($this->input('email'))) {
            $this->merge([
                'email' => Str::lower($this->string('email')->toString()),
            ]);
        }
    }
}
