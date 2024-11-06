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
        document.getElementById('register-message').innerText = `User ${data.userId} created!`;
    } else {
        document.getElementById('register-message').innerText = `Error: ${data.message}`;
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

        // Store tokens in local storage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        document.getElementById('auth').style.display = 'none';
        document.getElementById('protected').style.display = 'block';
        accessProtected(); // Access protected route after login
    } else {
        document.getElementById('login-message').innerText = `Error: ${data.message}`;
    }
}

// Function to access protected route
async function accessProtected() {
    const response = await fetch('/protected', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('protected-content').innerHTML = `
            <p><strong>User ID:</strong> ${data.user.userId}</p>
            <p><strong>Name:</strong> ${data.user.firstName} ${data.user.lastName}</p>
            <p><strong>Date of Birth:</strong> ${data.user.dob}</p>
        `;
    } else {
        handleTokenExpiry();
    }
}

// Handle token expiration and refresh
async function handleTokenExpiry() {
    const response = await fetch('/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    if (response.ok) {
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        accessProtected(); // Retry accessing protected route
    } else {
        logout();
    }
}

// Fetch all users and display them
async function fetchUsers() {
    const response = await fetch('/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();
    if (response.ok) {
        displayUsers(data);
    } else {
        handleTokenExpiry();
    }
}

// Function to display all users with details
function displayUsers(users) {
    const userListDiv = document.getElementById('user-list');
    userListDiv.innerHTML = ''; // Clear previous content

    if (users.length === 0) {
        userListDiv.innerHTML = '<p>No users found.</p>';
        return;
    }

    const list = document.createElement('ul');
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <p><strong>User ID:</strong> ${user.userId}</p>
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Date of Birth:</strong> ${user.dob}</p>
        `;
        list.appendChild(listItem);
    });

    userListDiv.appendChild(list);
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    accessToken = null;
    refreshToken = null;

    document.getElementById('auth').style.display = 'block';
    document.getElementById('protected').style.display = 'none';
    document.getElementById('login-message').innerText = '';
    document.getElementById('register-message').innerText = '';
}
