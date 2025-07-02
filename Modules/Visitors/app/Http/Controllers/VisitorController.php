<?php

namespace Modules\Visitors\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Visitors\Http\Requests\StoreVisitorRequest;
use Modules\Visitors\Http\Requests\UpdateVisitorRequest;
use Modules\Visitors\Models\Visitor;
use Modules\Visitors\Services\VisitorService;

class VisitorController extends Controller
{
    public function __construct(
        private VisitorService $visitorService
    ) {
        $this->middleware('auth');
        $this->middleware('can:view_visitors')->only(['index', 'show']);
        $this->middleware('can:create_visitors')->only(['create', 'store']);
        $this->middleware('can:edit_visitors')->only(['edit', 'update']);
        $this->middleware('can:delete_visitors')->only(['destroy']);
    }

    /**
     * Display a listing of visitors.
     */
    public function index(Request $request): Response
    {
        $visitors = $this->visitorService->getFilteredVisitors($request->all());

        return Inertia::render('Visitors/Index', [
            'visitors' => $visitors,
            'filters' => $request->only([
                'search', 
                'service_type', 
                'age_group', 
                'is_first_time', 
                'wants_followup',
                'date_from',
                'date_to'
            ]),
            'serviceTypes' => $this->visitorService->getServiceTypes(),
            'ageGroups' => $this->visitorService->getAgeGroups(),
        ]);
    }

    /**
     * Show the form for creating a new visitor.
     */
    public function create(): Response
    {
        return Inertia::render('Visitors/Create', [
            'serviceTypes' => $this->visitorService->getServiceTypes(),
            'ageGroups' => $this->visitorService->getAgeGroups(),
            'hearAboutOptions' => $this->visitorService->getHearAboutOptions(),
        ]);
    }

    /**
     * Store a newly created visitor.
     */
    public function store(StoreVisitorRequest $request)
    {
        $visitor = $this->visitorService->createVisitor($request->validated());

        return redirect()
            ->route('visitors.show', $visitor)
            ->with('success', 'Visitor created successfully.');
    }

    /**
     * Display the specified visitor.
     */
    public function show(Visitor $visitor): Response
    {
        $visitor->load(['followUps.followedUpBy']);

        return Inertia::render('Visitors/Show', [
            'visitor' => $visitor,
            'followUps' => $visitor->followUps,
            'stats' => $this->visitorService->getVisitorStats($visitor),
        ]);
    }

    /**
     * Show the form for editing the specified visitor.
     */
    public function edit(Visitor $visitor): Response
    {
        return Inertia::render('Visitors/Edit', [
            'visitor' => $visitor,
            'serviceTypes' => $this->visitorService->getServiceTypes(),
            'ageGroups' => $this->visitorService->getAgeGroups(),
            'hearAboutOptions' => $this->visitorService->getHearAboutOptions(),
        ]);
    }

    /**
     * Update the specified visitor.
     */
    public function update(UpdateVisitorRequest $request, Visitor $visitor)
    {
        $this->visitorService->updateVisitor($visitor, $request->validated());

        return redirect()
            ->route('visitors.show', $visitor)
            ->with('success', 'Visitor updated successfully.');
    }

    /**
     * Remove the specified visitor.
     */
    public function destroy(Visitor $visitor)
    {
        $this->visitorService->deleteVisitor($visitor);

        return redirect()
            ->route('visitors.index')
            ->with('success', 'Visitor deleted successfully.');
    }

    /**
     * Export visitors data.
     */
    public function export(Request $request)
    {
        $this->authorize('export_visitors');

        return $this->visitorService->exportVisitors($request->all());
    }
}
