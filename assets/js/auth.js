$(document).ready(function () {
    $('#login-form').on('submit', function (event) {
        event.preventDefault();

        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();

        $.ajax({
            url: '/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: email, password: password }),
            success: function (response) {
                localStorage.setItem('token', response.token);
                window.location.href = '/';
            },
            error: function (xhr, status, error) {
                alert('Login failed: ' + xhr.responseText);
            }
        });
    });

    // Check if the user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token with a request to a protected route or simply redirect
        $.ajax({
            url: '/bids',
            type: 'GET',
            headers: { 'Authorization': token },
            success: function () {
                $('.login-btn, .signup-btn').hide();  // Assuming you have buttons with these classes
                window.location.href = '/';
            },
            error: function () {
                // Token is invalid or expired, clear it from localStorage
                localStorage.removeItem('token');
            }
        });
    }
});
