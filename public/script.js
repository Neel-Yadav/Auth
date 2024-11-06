let accessToken = null;
let refreshToken = null;

// Initialize tokens on page load
window.onload = function() {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
    console.log("Loaded access token:", accessToken);
    if (accessToken) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('protected').style.display = 'block';
        accessProtected();
    }
};

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
    } else {
        alert(`Registration failed: ${data.message}`);
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

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        alert("Login successful!");
        document.getElementById('auth').style.display = 'none';
        document.getElementById('protected').style.display = 'block';
        accessProtected();
    } else {
        alert(`Login failed: ${data.message}`);
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
        console.warn("Access denied. Token may be expired. Attempting to refresh token.");
        await refreshAccessToken();
        await accessProtected(); // Retry after refreshing the token
    } else {
        alert("Failed to access protected route.");
    }
}

// Refresh Token
async function refreshAccessToken() {
    const response = await fetch('/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    if (response.ok) {
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        console.log("Access token refreshed successfully:", accessToken);
    } else {
        console.error("Failed to refresh access token.");
        alert("Session expired. Please log in again.");
        logout();
    }
}

// Logout function
function logout() {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    document.getElementById('auth').style.display = 'block';
    document.getElementById('protected').style.display = 'none';
    alert("Logged out successfully");
}

// List all users function
async function listUsers() {
    const response = await fetch('/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
        const users = await response.json();
        displayUsers(users);
    } else if (response.status === 403) {
        console.warn("Access denied. Attempting to refresh token.");
        await refreshAccessToken();
        await listUsers();
    } else {
        alert("Failed to retrieve user list.");
    }
}

// Function to display users
function displayUsers(users) {
    const userListDiv = document.getElementById('user-list');
    userListDiv.innerHTML = '';

    if (users.length === 0) {
        userListDiv.innerHTML = '<p>No users found.</p>';
        return;
    }

    const list = document.createElement('ul');
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerText = `User ID: ${user.userId}, Name: ${user.firstName} ${user.lastName}, DOB: ${user.dob}`;
        list.appendChild(listItem);
    });

    userListDiv.appendChild(list);
}
