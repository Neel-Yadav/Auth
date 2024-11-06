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

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, dob, username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log("Registration successful:", data);
            alert(`Registration successful! Your User ID is: ${data.userId}`);
        } else {
            console.error("Registration failed:", data.message);
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Check console for details.");
    }
}

// Login function
async function login() {
    const userId = document.getElementById('login-userId').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, password })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Login successful:", data);
            accessToken = data.accessToken;
            refreshToken = data.refreshToken;

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            document.getElementById('auth').style.display = 'none';
            document.getElementById('protected').style.display = 'block';
            accessProtected(); // Access protected content after logging in
        } else {
            console.error("Login failed:", data.message);
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Check console for details.");
    }
}

// Access Protected Route
async function accessProtected() {
    try {
        const response = await fetch('/protected', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Protected route accessed:", data);
            document.getElementById('protected-content').innerText = `Hello ${data.user.firstName} ${data.user.lastName}. Your date of birth is ${data.user.dob} and your User ID is ${data.user.userId}.`;
        } else if (response.status === 403) {
            console.warn("Access denied. Attempting to refresh token.");
            refreshAccessToken();
        } else {
            console.error("Failed to access protected route. Status:", response.status);
            alert("Failed to access protected route.");
        }
    } catch (error) {
        console.error("Error accessing protected route:", error);
        alert("An error occurred accessing protected route. Check console for details.");
    }
}

// Refresh access token
async function refreshAccessToken() {
    try {
        const response = await fetch('/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Access token refreshed:", data);
            accessToken = data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            accessProtected();
        } else {
            console.error("Failed to refresh access token. Status:", response.status);
            alert("Failed to refresh access token. Please log in again.");
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
        alert("An error occurred refreshing access token. Check console for details.");
    }
}

// List all users function
async function listUsers() {
    try {
        const response = await fetch('/users', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            const users = await response.json();
            console.log("User list fetched:", users);
            displayUsers(users);
        } else {
            console.error("Failed to retrieve user list. Status:", response.status);
            alert("Failed to retrieve user list.");
        }
    } catch (error) {
        console.error("Error fetching user list:", error);
        alert("An error occurred fetching user list. Check console for details.");
    }
}

// Function to display users
function displayUsers(users) {
    const userListDiv = document.getElementById('users-container');
    userListDiv.innerHTML = ''; // Clear previous content

    if (users.length === 0) {
        console.warn("No users found in the list.");
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
    console.log("User list displayed.");
}

// Logout function
function logout() {
    console.log("Logging out user...");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    accessToken = null;
    refreshToken = null;
    document.getElementById('auth').style.display = 'block';
    document.getElementById('protected').style.display = 'none';
    console.log("User logged out.");
}
