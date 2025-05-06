<?php
// filepath: app/Http/Requests/Admin/UpdateNavigationRequest.php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNavigationRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()->can('manage_navigation');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'route' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:100'],
            'permission_name' => ['nullable', 'string', 'exists:permissions,name'],
            'parent_id' => ['nullable', 'exists:menu_items,id'],
            'order' => ['required', 'integer', 'min:0'],
            'type' => ['required', 'string', 'in:main,footer,user'],
        ];
    }
}