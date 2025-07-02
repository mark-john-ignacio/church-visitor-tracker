<?php

namespace Modules\Visitors\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVisitorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('edit_visitors');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
            'visit_date' => ['required', 'date'],
            'invited_by' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'service_type' => ['nullable', 'string', 'max:100'],
            'is_first_time' => ['boolean'],
            'age_group' => ['nullable', 'string', 'in:child,teen,adult,senior'],
            'how_did_you_hear' => ['nullable', 'string', 'max:255'],
            'wants_followup' => ['boolean'],
            'wants_newsletter' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The visitor name is required.',
            'visit_date.required' => 'The visit date is required.',
            'visit_date.date' => 'The visit date must be a valid date.',
            'email.email' => 'The email must be a valid email address.',
            'age_group.in' => 'The age group must be one of: Child, Teen, Adult, Senior.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'is_first_time' => 'first time visitor',
            'wants_followup' => 'wants follow-up',
            'wants_newsletter' => 'wants newsletter',
        ];
    }
}
