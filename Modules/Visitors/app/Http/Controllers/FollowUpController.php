<?php

namespace Modules\Visitors\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Visitors\Http\Requests\StoreFollowUpRequest;
use Modules\Visitors\Http\Requests\UpdateFollowUpRequest;
use Modules\Visitors\Models\FollowUp;
use Modules\Visitors\Models\Visitor;
use Modules\Visitors\Services\FollowUpService;

class FollowUpController extends Controller
{
    public function __construct(
        private FollowUpService $followUpService
    ) {
        $this->middleware('auth');
        $this->middleware('can:view_followups')->only(['index', 'show']);
        $this->middleware('can:create_followups')->only(['create', 'store']);
        $this->middleware('can:edit_followups')->only(['edit', 'update']);
        $this->middleware('can:delete_followups')->only(['destroy']);
    }

    /**
     * Display a listing of follow-ups.
     */
    public function index(Request $request): Response
    {
        $followUps = $this->followUpService->getFilteredFollowUps($request->all());

        return Inertia::render('FollowUps/Index', [
            'followUps' => $followUps,
            'filters' => $request->only([
                'search', 
                'status', 
                'method', 
                'followed_up_by',
                'date_from',
                'date_to'
            ]),
            'statusOptions' => FollowUp::getStatusOptions(),
            'methodOptions' => FollowUp::getMethodOptions(),
            'users' => $this->followUpService->getFollowUpUsers(),
        ]);
    }

    /**
     * Show the form for creating a new follow-up.
     */
    public function create(Request $request): Response
    {
        $visitor = null;
        if ($request->has('visitor_id')) {
            $visitor = Visitor::findOrFail($request->visitor_id);
        }

        return Inertia::render('FollowUps/Create', [
            'visitor' => $visitor,
            'visitors' => $this->followUpService->getVisitorsForSelect(),
            'statusOptions' => FollowUp::getStatusOptions(),
            'methodOptions' => FollowUp::getMethodOptions(),
        ]);
    }

    /**
     * Store a newly created follow-up.
     */
    public function store(StoreFollowUpRequest $request)
    {
        $followUp = $this->followUpService->createFollowUp($request->validated());

        return redirect()
            ->route('followups.show', $followUp)
            ->with('success', 'Follow-up created successfully.');
    }

    /**
     * Display the specified follow-up.
     */
    public function show(FollowUp $followup): Response
    {
        $followup->load(['visitor', 'followedUpBy']);

        return Inertia::render('FollowUps/Show', [
            'followUp' => $followup,
        ]);
    }

    /**
     * Show the form for editing the specified follow-up.
     */
    public function edit(FollowUp $followup): Response
    {
        $followup->load(['visitor']);

        return Inertia::render('FollowUps/Edit', [
            'followUp' => $followup,
            'statusOptions' => FollowUp::getStatusOptions(),
            'methodOptions' => FollowUp::getMethodOptions(),
        ]);
    }

    /**
     * Update the specified follow-up.
     */
    public function update(UpdateFollowUpRequest $request, FollowUp $followup)
    {
        $this->followUpService->updateFollowUp($followup, $request->validated());

        return redirect()
            ->route('followups.show', $followup)
            ->with('success', 'Follow-up updated successfully.');
    }

    /**
     * Remove the specified follow-up.
     */
    public function destroy(FollowUp $followup)
    {
        $this->followUpService->deleteFollowUp($followup);

        return redirect()
            ->route('followups.index')
            ->with('success', 'Follow-up deleted successfully.');
    }

    /**
     * Mark follow-up as completed.
     */
    public function complete(FollowUp $followup, Request $request)
    {
        $this->authorize('edit_followups');

        $followup->markAsCompleted($request->input('notes'));

        return back()->with('success', 'Follow-up marked as completed.');
    }
}
