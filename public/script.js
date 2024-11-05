let accessToken = null;
let refreshToken = null;

// Register function
async function register() {
  const firstName = document.getElementById('register-firstName').value;
  const lastName = document.getElementById('register-lastName').value;
  const dob = document.getElementById('register-dob').value;
  const username = document.getElementById('register-username').value; // Use username as ID
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
  const userId = document.getElementById('login-userId').value; // Use username as user ID
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
    alert("Login successful!");

    // Show protected section
    document.getElementById('auth').style.display = 'none';
    document.getElementById('protected').style.display = 'block';
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
    document.getElementById('protected-content').innerText = `Hello ${data.user.firstName} ${data.user.lastName}, your DOB is ${data.user.dob} and your User ID is ${data.user.userId}.`;
  } else if (response.status === 403) {
    await refreshAccessToken();
    accessProtected(); // Retry the request
  } else {
    alert("Failed to access protected route.");
  }
}

// Refresh Access Token
async function refreshAccessToken() {
  const response = await fetch('/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  if (response.ok) {
    accessToken = data.accessToken;
  } else {
    alert("Session expired. Please log in again.");
    window.location.reload();
  }
      }
