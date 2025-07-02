<?php

namespace Modules\Visitors\database\seeders;

use Illuminate\Database\Seeder;
use Modules\Visitors\app\Models\Visitor;
use Modules\Visitors\app\Models\FollowUp;
use Carbon\Carbon;

class VisitorsSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = session('company_id');
        
        if (!$companyId) {
            $this->command->warn('No company_id in session. Skipping visitors seeding.');
            return;
        }

        // Create some demo visitors
        $visitors = [
            [
                'name' => 'Alice Johnson',
                'email' => 'alice.johnson@email.com',
                'phone' => '(555) 234-5678',
                'address' => '456 Oak Avenue, Anytown, USA',
                'visit_date' => Carbon::now()->subDays(2),
                'invited_by' => 'Mary Smith',
                'service_type' => 'Sunday Service',
                'is_first_time' => true,
                'age_group' => 'adult',
                'how_did_you_hear' => 'Friend/Family',
                'wants_followup' => true,
                'wants_newsletter' => true,
                'notes' => 'Very interested in small groups and community service opportunities.',
                'tags' => ['new', 'interested', 'small-groups'],
            ],
            [
                'name' => 'Bob Williams',
                'email' => 'bob.williams@email.com',
                'phone' => '(555) 345-6789',
                'visit_date' => Carbon::now()->subDays(5),
                'invited_by' => 'John Smith',
                'service_type' => 'Sunday Service',
                'is_first_time' => true,
                'age_group' => 'adult',
                'how_did_you_hear' => 'Website',
                'wants_followup' => true,
                'wants_newsletter' => false,
                'notes' => 'Moved to town recently, looking for a church home.',
                'tags' => ['new', 'relocating'],
            ],
            [
                'name' => 'Carol Davis',
                'email' => 'carol.davis@email.com',
                'phone' => '(555) 456-7890',
                'visit_date' => Carbon::now()->subWeek(),
                'service_type' => 'Bible Study',
                'is_first_time' => false,
                'age_group' => 'senior',
                'how_did_you_hear' => 'Friend/Family',
                'wants_followup' => false,
                'wants_newsletter' => true,
                'notes' => 'Has been attending for a few weeks, interested in joining.',
                'tags' => ['regular', 'potential-member'],
            ],
            [
                'name' => 'David Miller',
                'email' => null,
                'phone' => '(555) 567-8901',
                'visit_date' => Carbon::now()->subDays(10),
                'service_type' => 'Sunday Service',
                'is_first_time' => true,
                'age_group' => 'teen',
                'how_did_you_hear' => 'Social Media',
                'wants_followup' => true,
                'wants_newsletter' => false,
                'notes' => 'Teenager who came with friends. Parents not attending yet.',
                'tags' => ['teen', 'friends', 'new'],
            ],
            [
                'name' => 'Emily Brown',
                'email' => 'emily.brown@email.com',
                'phone' => '(555) 678-9012',
                'visit_date' => Carbon::now()->subDays(14),
                'invited_by' => 'Sarah Jones',
                'service_type' => 'Youth Service',
                'is_first_time' => true,
                'age_group' => 'adult',
                'how_did_you_hear' => 'Friend/Family',
                'wants_followup' => true,
                'wants_newsletter' => true,
                'notes' => 'Young mother with two children. Interested in youth programs.',
                'tags' => ['parent', 'youth-programs', 'new'],
            ],
        ];

        foreach ($visitors as $visitorData) {
            $visitor = Visitor::create(array_merge($visitorData, [
                'company_id' => $companyId,
            ]));

            // Create some follow-ups for visitors who want them
            if ($visitor->wants_followup) {
                FollowUp::create([
                    'company_id' => $companyId,
                    'visitor_id' => $visitor->id,
                    'followed_up_by' => 2, // Admin user
                    'status' => 'completed',
                    'method' => 'phone',
                    'notes' => 'Initial welcome call. Visitor was very friendly and expressed interest in learning more about our church.',
                    'completed_at' => $visitor->visit_date->addDay(),
                ]);

                // Some visitors get a second follow-up
                if (in_array($visitor->name, ['Alice Johnson', 'Emily Brown'])) {
                    FollowUp::create([
                        'company_id' => $companyId,
                        'visitor_id' => $visitor->id,
                        'followed_up_by' => 3, // Staff user
                        'status' => 'pending',
                        'method' => 'email',
                        'notes' => 'Need to follow up about small group information.',
                        'scheduled_at' => now()->addDays(2),
                    ]);
                }
            }
        }

        $this->command->info('Created ' . count($visitors) . ' demo visitors with follow-ups.');
    }
}
