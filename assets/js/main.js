document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Function to get a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Check if the 'token' cookie exists
    const token = getCookie('token');
    if (token) {
        // If the token exists, hide the login and signup buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    }
    else{
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});
