<?php

namespace Modules\Visitors\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Visitors\Models\Visitor;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VisitorService
{
    /**
     * Get filtered visitors with pagination.
     */
    public function getFilteredVisitors(array $filters = []): LengthAwarePaginator
    {
        $query = Visitor::with(['followUps' => function ($q) {
            $q->latest()->take(1);
        }]);

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['service_type'])) {
            $query->where('service_type', $filters['service_type']);
        }

        if (!empty($filters['age_group'])) {
            $query->where('age_group', $filters['age_group']);
        }

        if (isset($filters['is_first_time']) && $filters['is_first_time'] !== '') {
            $query->where('is_first_time', (bool) $filters['is_first_time']);
        }

        if (isset($filters['wants_followup']) && $filters['wants_followup'] !== '') {
            $query->where('wants_followup', (bool) $filters['wants_followup']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('visit_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('visit_date', '<=', $filters['date_to']);
        }

        return $query->latest('visit_date')->paginate(15);
    }

    /**
     * Create a new visitor.
     */
    public function createVisitor(array $data): Visitor
    {
        // Process tags if present
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_map('trim', explode(',', $data['tags']));
        }

        return Visitor::create($data);
    }

    /**
     * Update an existing visitor.
     */
    public function updateVisitor(Visitor $visitor, array $data): Visitor
    {
        // Process tags if present
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_map('trim', explode(',', $data['tags']));
        }

        $visitor->update($data);
        return $visitor;
    }

    /**
     * Delete a visitor.
     */
    public function deleteVisitor(Visitor $visitor): bool
    {
        return $visitor->delete();
    }

    /**
     * Get visitor statistics.
     */
    public function getVisitorStats(Visitor $visitor): array
    {
        return [
            'total_follow_ups' => $visitor->followUps()->count(),
            'pending_follow_ups' => $visitor->followUps()->where('status', 'pending')->count(),
            'completed_follow_ups' => $visitor->followUps()->where('status', 'completed')->count(),
            'last_contact' => $visitor->followUps()->latest()->first()?->created_at,
        ];
    }

    /**
     * Get dashboard statistics.
     */
    public function getDashboardStats(): array
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'total_visitors' => Visitor::count(),
            'first_time_visitors' => Visitor::where('is_first_time', true)->count(),
            'visitors_today' => Visitor::whereDate('visit_date', $today)->count(),
            'visitors_this_week' => Visitor::where('visit_date', '>=', $thisWeek)->count(),
            'visitors_this_month' => Visitor::where('visit_date', '>=', $thisMonth)->count(),
            'pending_follow_ups' => DB::table('follow_ups')
                ->where('company_id', session('company_id'))
                ->where('status', 'pending')
                ->count(),
            'recent_visitors' => Visitor::with('followUps')
                ->latest('visit_date')
                ->take(5)
                ->get(),
        ];
    }

    /**
     * Get service types for dropdown.
     */
    public function getServiceTypes(): array
    {
        return [
            'Sunday Service' => 'Sunday Service',
            'Bible Study' => 'Bible Study',
            'Prayer Meeting' => 'Prayer Meeting',
            'Youth Service' => 'Youth Service',
            'Special Event' => 'Special Event',
            'Small Group' => 'Small Group',
            'Other' => 'Other',
        ];
    }

    /**
     * Get age groups for dropdown.
     */
    public function getAgeGroups(): array
    {
        return [
            'child' => 'Child (0-12)',
            'teen' => 'Teen (13-17)',
            'adult' => 'Adult (18-64)',
            'senior' => 'Senior (65+)',
        ];
    }

    /**
     * Get "how did you hear" options.
     */
    public function getHearAboutOptions(): array
    {
        return [
            'Friend/Family' => 'Friend/Family',
            'Website' => 'Website',
            'Social Media' => 'Social Media',
            'Google' => 'Google',
            'Flyer/Advertisement' => 'Flyer/Advertisement',
            'Community Event' => 'Community Event',
            'Walk-in' => 'Walk-in',
            'Other' => 'Other',
        ];
    }

    /**
     * Export visitors to CSV.
     */
    public function exportVisitors(array $filters = []): StreamedResponse
    {
        $query = Visitor::with(['followUps']);

        // Apply same filters as getFilteredVisitors
        // ... (filter logic would be same as above)

        $filename = 'visitors_export_' . now()->format('Y_m_d_H_i_s') . '.csv';

        return new StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($handle, [
                'Name',
                'Email',
                'Phone',
                'Visit Date',
                'Service Type',
                'Age Group',
                'First Time',
                'Invited By',
                'How Did You Hear',
                'Wants Follow-up',
                'Wants Newsletter',
                'Total Follow-ups',
                'Pending Follow-ups',
                'Notes',
            ]);

            // Write data
            $query->chunk(100, function ($visitors) use ($handle) {
                foreach ($visitors as $visitor) {
                    fputcsv($handle, [
                        $visitor->name,
                        $visitor->email,
                        $visitor->phone,
                        $visitor->visit_date->format('Y-m-d'),
                        $visitor->service_type,
                        $visitor->age_group,
                        $visitor->is_first_time ? 'Yes' : 'No',
                        $visitor->invited_by,
                        $visitor->how_did_you_hear,
                        $visitor->wants_followup ? 'Yes' : 'No',
                        $visitor->wants_newsletter ? 'Yes' : 'No',
                        $visitor->followUps->count(),
                        $visitor->followUps->where('status', 'pending')->count(),
                        $visitor->notes,
                    ]);
                }
            });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
