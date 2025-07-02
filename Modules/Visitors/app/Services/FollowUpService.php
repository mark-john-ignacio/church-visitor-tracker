<?php

namespace Modules\Visitors\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Visitors\Models\FollowUp;
use Modules\Visitors\Models\Visitor;

class FollowUpService
{
    /**
     * Get filtered follow-ups with pagination.
     */
    public function getFilteredFollowUps(array $filters = []): LengthAwarePaginator
    {
        $query = FollowUp::with(['visitor', 'followedUpBy']);

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('visitor', function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('notes', 'like', "%{$search}%");
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['method'])) {
            $query->where('method', $filters['method']);
        }

        if (!empty($filters['followed_up_by'])) {
            $query->where('followed_up_by', $filters['followed_up_by']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to'] . ' 23:59:59');
        }

        return $query->latest()->paginate(15);
    }

    /**
     * Create a new follow-up.
     */
    public function createFollowUp(array $data): FollowUp
    {
        return FollowUp::create($data);
    }

    /**
     * Update an existing follow-up.
     */
    public function updateFollowUp(FollowUp $followUp, array $data): FollowUp
    {
        $followUp->update($data);
        return $followUp;
    }

    /**
     * Delete a follow-up.
     */
    public function deleteFollowUp(FollowUp $followUp): bool
    {
        return $followUp->delete();
    }

    /**
     * Get users who can perform follow-ups.
     */
    public function getFollowUpUsers(): array
    {
        return User::whereHas('companies', function ($query) {
                $query->where('company_id', session('company_id'));
            })
            ->where('is_active', true)
            ->get(['id', 'name'])
            ->pluck('name', 'id')
            ->toArray();
    }

    /**
     * Get visitors for dropdown selection.
     */
    public function getVisitorsForSelect(): array
    {
        return Visitor::select('id', 'name', 'email', 'visit_date')
            ->latest('visit_date')
            ->get()
            ->map(function ($visitor) {
                return [
                    'id' => $visitor->id,
                    'label' => $visitor->display_name . ' (' . $visitor->visit_date->format('M j, Y') . ')',
                ];
            })
            ->pluck('label', 'id')
            ->toArray();
    }

    /**
     * Get dashboard follow-up statistics.
     */
    public function getDashboardStats(): array
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();

        return [
            'total_follow_ups' => FollowUp::count(),
            'pending_follow_ups' => FollowUp::where('status', 'pending')->count(),
            'completed_today' => FollowUp::where('status', 'completed')
                ->whereDate('completed_at', $today)
                ->count(),
            'overdue_follow_ups' => FollowUp::where('status', 'pending')
                ->where('scheduled_at', '<', now())
                ->whereNotNull('scheduled_at')
                ->count(),
            'scheduled_this_week' => FollowUp::where('status', 'scheduled')
                ->whereBetween('scheduled_at', [$thisWeek, $thisWeek->copy()->endOfWeek()])
                ->count(),
        ];
    }

    /**
     * Get recent follow-up activities.
     */
    public function getRecentActivities(int $limit = 10): array
    {
        return FollowUp::with(['visitor', 'followedUpBy'])
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($followUp) {
                return [
                    'id' => $followUp->id,
                    'visitor_name' => $followUp->visitor->name,
                    'status' => $followUp->status_label,
                    'method' => $followUp->method_label,
                    'followed_up_by' => $followUp->followedUpBy->name,
                    'created_at' => $followUp->created_at,
                    'notes' => $followUp->notes,
                ];
            })
            ->toArray();
    }

    /**
     * Get overdue follow-ups.
     */
    public function getOverdueFollowUps(): array
    {
        return FollowUp::with(['visitor', 'followedUpBy'])
            ->where('status', 'pending')
            ->where('scheduled_at', '<', now())
            ->whereNotNull('scheduled_at')
            ->get()
            ->map(function ($followUp) {
                return [
                    'id' => $followUp->id,
                    'visitor' => $followUp->visitor,
                    'scheduled_at' => $followUp->scheduled_at,
                    'days_overdue' => $followUp->scheduled_at->diffInDays(now()),
                    'followed_up_by' => $followUp->followedUpBy->name,
                ];
            })
            ->toArray();
    }
}
