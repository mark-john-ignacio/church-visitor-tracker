<?php

use App\Models\ChartOfAccount;

echo "Testing ChartOfAccount audit configuration...\n";

$account = ChartOfAccount::first();
if ($account) {
    echo "Audit include fields: " . json_encode($account->getAuditInclude()) . "\n";
    echo "Audit tags: " . json_encode($account->generateTags()) . "\n";
    echo "Model has audit trait: " . (in_array('OwenIt\Auditing\Auditable', class_uses_recursive($account)) ? 'Yes' : 'No') . "\n";
} else {
    echo "No ChartOfAccount records found\n";
}

echo "Testing completed successfully!\n";
