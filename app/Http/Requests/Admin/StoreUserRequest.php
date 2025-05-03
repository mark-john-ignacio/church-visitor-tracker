<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;

class StoreUserRequest extends FormRequest
{
    public function authorize() {return true;}

    public function rules():array
    {
        return [
            'name'                  => ['required','string','max:255'],
            'email'                 => ['required','email','max:255','unique:users,email'],
            'password'              => ['required','confirmed',Password::defaults()],
            'roles'                 => ['required','array','min:1'],
            'roles.*'               => ['string','exists:roles,name'],
        ];
    }

    public function validatedWithHash(): array
    {
        $data = $this->validated();
        $data['password'] = Hash::make($data['password']);
        return $data;
    }
}