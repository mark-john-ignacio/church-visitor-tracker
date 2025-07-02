<?php

namespace Modules\Visitors\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Visitors\app\Models\FollowUp;

class UpdateFollowUpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('edit_followups');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:' . implode(',', array_keys(FollowUp::getStatusOptions()))],
            'method' => ['required', 'string', 'in:' . implode(',', array_keys(FollowUp::getMethodOptions()))],
            'notes' => ['nullable', 'string', 'max:2000'],
            'scheduled_at' => ['nullable', 'date'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
            'method.required' => 'Please select a follow-up method.',
            'method.in' => 'The selected method is invalid.',
        ];
    }
}
