<?php
require_once 'vendor/autoload.php';

session_start();

$client = new Google_Client();
// we use zhiyang mei's OAuth2.0 API
$client->setClientId('1014034833688-u0ggp3cusg2i27rr1g6fplrhf3ve22l5.apps.googleusercontent.com');
$client->setClientSecret('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');
$client->setRedirectUri('https://deco1800teams-t27-8am.uqcloud.net/login.php');
$client->addScope("email");
$client->addScope("profile");

// Set prompt to select account
$client->setPrompt('select_account');

// Check if code is set
if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    if (isset($token['error'])) {
        echo "Error fetching access token: " . htmlspecialchars($token['error']);
        exit;
    }
    // Set access token
    $client->setAccessToken($token['access_token']);

    // Get user info
    $google_oauth = new Google_Service_Oauth2($client);
    $google_account_info = $google_oauth->userinfo->get();

    // Set session variables
    $_SESSION['user_email'] = $google_account_info->email;
    $_SESSION['user_name'] = $google_account_info->name;
    $_SESSION['user_picture'] = $google_account_info->picture;

    // Redirect to index.html
    header('Location: index.html');
    exit;
} else {
    // Create auth URL
    $auth_url = $client->createAuthUrl();
    header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
    exit;
}
?>
