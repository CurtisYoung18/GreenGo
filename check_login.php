<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_email'])) {
    echo json_encode([
        'logged_in' => true,
        'user_picture' => $_SESSION['user_picture'] ?? '',
        'user_name' => $_SESSION['user_name'] ?? ''
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>
