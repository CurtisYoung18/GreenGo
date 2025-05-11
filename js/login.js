// Function to handle login button click
$(document).ready(function() {
    // Function to handle login button click
    $('#login-button').click(function(e) {
        e.preventDefault();
        window.location.href = 'login.php';
    });

    // Function to handle logout button click
    $('#logout-button').click(function(e) {
        e.preventDefault();
        $.post('logout.php', function(data) {
            if (data.success) {
                localStorage.removeItem('user_picture');
                updateUIForLogout();
            } else {
                console.error("Logout failed");
            }
        }, 'json').fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Logout request failed:", textStatus, errorThrown);
        });
    });

    // Function to handle user profile click
    $('#user-profile').click(function(e) {
        e.stopPropagation();
        $('#dropdown-menu').toggleClass('show');
    });

    // Function to hide dropdown menu when document is clicked
    $(document).click(function() {
        $('#dropdown-menu').removeClass('show');
    });

    // Function to check login status
    function checkLoginStatus() {
        $.get('check_login.php', function(data) {
            if (data.logged_in) {
                updateUIForLogin(data.user_picture, data.user_name);
            } else {
                updateUIForLogout();
            }
        }, 'json').fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Check login status failed:", textStatus, errorThrown);
        });
    }

    // Function to update UI for login
    function updateUIForLogin(userPicture, userName) {
        $('#google-login').hide();
        $('#user-profile').show();
        $('#user-avatar').attr('src', userPicture);
    }

    // Function to update UI for logout
    function updateUIForLogout() {
        $('#google-login').show();
        $('#user-profile').hide();
    }

    // Check login status
    checkLoginStatus();
}); 
