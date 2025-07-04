<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Modules\Visitors\Services\VisitorService;
use Modules\Visitors\Services\FollowUpService;

class DashboardController extends Controller
{
    public function __construct(
        private VisitorService $visitorService,
        private FollowUpService $followUpService
    ) {
        $this->middleware('auth');
    }

    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $visitorStats = $this->visitorService->getDashboardStats();
        $followUpStats = $this->followUpService->getDashboardStats();
        $recentActivities = $this->followUpService->getRecentActivities(5);
        $overdueFollowUps = $this->followUpService->getOverdueFollowUps();

        return Inertia::render('dashboard', [
            'stats' => array_merge($visitorStats, $followUpStats),
            'recentActivities' => $recentActivities,
            'overdueFollowUps' => $overdueFollowUps,
            'chartData' => $this->getChartData(),
        ]);
    }

    /**
     * Get chart data for dashboard.
     */
    private function getChartData(): array
    {
        // Get visitor trends for the last 30 days
        $visitorTrends = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $visitorTrends[] = [
                'date' => $date->format('M j'),
                'visitors' => \Modules\Visitors\Models\Visitor::whereDate('visit_date', $date)->count(),
                'first_time' => \Modules\Visitors\Models\Visitor::whereDate('visit_date', $date)
                    ->where('is_first_time', true)->count(),
            ];
        }

        // Get follow-up status distribution
        $followUpDistribution = \Modules\Visitors\Models\FollowUp::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'label' => ucfirst(str_replace('_', ' ', $item->status)),
                    'count' => $item->count,
                ];
            });

        // Get age group distribution
        $ageGroupDistribution = \Modules\Visitors\Models\Visitor::selectRaw('age_group, count(*) as count')
            ->whereNotNull('age_group')
            ->groupBy('age_group')
            ->get()
            ->map(function ($item) {
                return [
                    'age_group' => $item->age_group,
                    'label' => ucfirst($item->age_group),
                    'count' => $item->count,
                ];
            });

        return [
            'visitorTrends' => $visitorTrends,
            'followUpDistribution' => $followUpDistribution,
            'ageGroupDistribution' => $ageGroupDistribution,
        ];
    }
}
