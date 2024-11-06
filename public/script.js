let accessToken = null;
let refreshToken = null;

// Check for existing tokens on page load
window.onload = function() {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');

    if (accessToken) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('protected').style.display = 'block';
        accessProtected(); // Automatically access the protected route
    }
};

// Toggle between Register and Login forms
function toggleForms() {
    const authDiv = document.getElementById('auth');
    const loginFormDiv = document.getElementById('login-form');
    const protectedDiv = document.getElementById('protected');

    if (authDiv.style.display === 'none') {
        authDiv.style.display = 'block';
        loginFormDiv.style.display = 'none';
        protectedDiv.style.display = 'none';
    } else {
        authDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
        protectedDiv.style.display = 'none';
    }
}

// Register function
async function register() {
    const firstName = document.getElementById('register-firstName').value;
    const lastName = document.getElementById('register-lastName').value;
    const dob = document.getElementById('register-dob').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, dob, username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert(`Registration successful! Your User ID is: ${data.userId}`);
        toggleForms(); // Show login form after registration
    } else {
        showMessage(`Registration failed: ${data.message}`);
    }
}

// Login function
async function login() {
    const userId = document.getElementById('login-userId').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
    });

    const data = await response.json();
    if (response.ok) {
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        alert("Login successful!");
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('protected').style.display = 'block';
        accessProtected(); // Access protected content after logging in
    } else {
        showMessage(`Login failed: ${data.message}`);
    }
}

// Access Protected Route
async function accessProtected() {
    const response = await fetch('/protected', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('protected-content').innerText = `Hello ${data.user.firstName} ${data.user.lastName}. Your date of birth is ${data.user.dob} and your User ID is ${data.user.userId}.`;
    } else if (response.status === 403) {
        alert("Access denied. Token may be expired. Attempting to refresh token...");
        await refreshAccessToken();
    } else {
        showMessage("Failed to access protected route.");
    }
}

// Refresh access token using refresh token
async function refreshAccessToken() {
    const response = await fetch('/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
        const data = await response.json();
        accessToken = data.accessToken;  // Update access token
        localStorage.setItem('accessToken', accessToken); // Store new access token
        accessProtected();  // Retry fetching protected content with new token
    } else {
        alert("Failed to refresh token. Please log in again.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toggleForms(); // Show login form after token refresh failure
    }
}

// List all users function
async function listUsers() {
    const response = await fetch('/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
        const data = await response.json();
        const userList = document.getElementById('user-list');
        userList.innerHTML = '<ul>' + data.users.map(user => `<li>${user.firstName} ${user.lastName} (User ID: ${user.userId})</li>`).join('') + '</ul>';
    } else {
        showMessage("Failed to fetch users.");
    }
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.getElementById('auth').style.display = 'block';
    document.getElementById('protected').style.display = 'none';
}

// Show error message
function showMessage(message) {
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('message-text');
    messageText.innerText = message;
    messageDiv.style.display = 'block';
}
