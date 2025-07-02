<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NavigationController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'permission:manage_navigation']);
    }

    /**
     * Display the navigation management page.
     */
    public function index(): Response
    {
        $menuItems = MenuItem::orderBy('order')->get();

        return Inertia::render('Admin/Navigation', [
            'menuItems' => $menuItems
        ]);
    }

    /**
     * Store a new navigation item.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'icon' => 'nullable|string|max:100',
            'permission' => 'nullable|string|max:100',
            'target' => 'nullable|string|in:_self,_blank',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        // Set order to the next available position
        $maxOrder = MenuItem::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        MenuItem::create($validated);

        return redirect()->back()->with('success', 'Navigation item created successfully.');
    }

    /**
     * Update an existing navigation item.
     */
    public function update(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'icon' => 'nullable|string|max:100',
            'permission' => 'nullable|string|max:100',
            'target' => 'nullable|string|in:_self,_blank',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean'
        ]);

        $menuItem->update($validated);

        return redirect()->back()->with('success', 'Navigation item updated successfully.');
    }

    /**
     * Delete a navigation item.
     */
    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        $menuItem->delete();

        return redirect()->back()->with('success', 'Navigation item deleted successfully.');
    }

    /**
     * Reorder navigation items.
     */
    public function reorder(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $direction = $request->input('direction');
        
        if ($direction === 'up') {
            $previousItem = MenuItem::where('order', '<', $menuItem->order)
                ->orderBy('order', 'desc')
                ->first();
                
            if ($previousItem) {
                $tempOrder = $menuItem->order;
                $menuItem->update(['order' => $previousItem->order]);
                $previousItem->update(['order' => $tempOrder]);
            }
        } elseif ($direction === 'down') {
            $nextItem = MenuItem::where('order', '>', $menuItem->order)
                ->orderBy('order', 'asc')
                ->first();
                
            if ($nextItem) {
                $tempOrder = $menuItem->order;
                $menuItem->update(['order' => $nextItem->order]);
                $nextItem->update(['order' => $tempOrder]);
            }
        }

        return redirect()->back();
    }

    /**
     * Toggle active status of a navigation item.
     */
    public function toggle(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $menuItem->update([
            'is_active' => $request->boolean('is_active')
        ]);

        return redirect()->back();
    }
}
