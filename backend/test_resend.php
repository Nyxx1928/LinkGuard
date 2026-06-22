<?php

require __DIR__.'/vendor/autoload.php';

$apiKey = 're_2u8frjkN_7uQcjec5NmFhnuYp2rqKsZGg';

// Test 1: Check API key by fetching account info
$ch = curl_init('https://api.resend.com/audiences');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer '.$apiKey,
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "=== API Key Test ===\n";
echo "HTTP Status: {$httpCode}\n";
if ($error) {
    echo "cURL Error: {$error}\n";
}
echo 'Response: '.substr($response, 0, 500)."\n\n";

// Test 2: Try to send a test email
$payload = json_encode([
    'from' => 'onboarding@resend.dev',
    'to' => ['test@example.com'], // Resend accepts this for testing
    'subject' => 'Test from LinkGuard',
    'text' => 'This is a test email to verify the API key works.',
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer '.$apiKey,
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "=== Send Email Test ===\n";
echo "HTTP Status: {$httpCode}\n";
if ($error) {
    echo "cURL Error: {$error}\n";
}
echo 'Response: '.substr($response, 0, 500)."\n";

if ($httpCode === 200 || $httpCode === 201) {
    echo "\n✅ API key works! Emails can be sent.\n";
} elseif ($httpCode === 401) {
    echo "\n❌ Invalid API key. Check your Resend dashboard.\n";
} elseif ($httpCode === 0) {
    echo "\n❌ Network error - can't reach Resend's API.\n";
} else {
    echo "\n⚠️  Unexpected response. Check Resend dashboard.\n";
}
