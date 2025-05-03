<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;

class UpdateUserRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules(): array
    {
        $id = $this->route('user')->id;
        return [
            'name'                  => ['required','string','min:2'],
            'email'                 => ['required','email',"unique:users,email,{$id}"],
            'password'              => ['nullable','confirmed','min:8'],
            'roles'                 => ['required','array','min:1'],
            'roles.*'               => ['string','exists:roles,name'],
        ];
    }

    public function validatedWithHash(): array
    {
        $data = $this->validated();
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        return $data;
    }
}