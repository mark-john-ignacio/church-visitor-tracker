<?php

namespace Modules\Visitors\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Visitors\app\Models\FollowUp;

class StoreFollowUpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create_followups');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'visitor_id' => ['required', 'exists:visitors,id'],
            'status' => ['required', 'string', 'in:' . implode(',', array_keys(FollowUp::getStatusOptions()))],
            'method' => ['required', 'string', 'in:' . implode(',', array_keys(FollowUp::getMethodOptions()))],
            'notes' => ['nullable', 'string', 'max:2000'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'visitor_id.required' => 'Please select a visitor.',
            'visitor_id.exists' => 'The selected visitor does not exist.',
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
            'method.required' => 'Please select a follow-up method.',
            'method.in' => 'The selected method is invalid.',
            'scheduled_at.after' => 'The scheduled date must be in the future.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set followed_up_by to current user
        $this->merge([
            'followed_up_by' => $this->user()->id,
        ]);
    }
}
