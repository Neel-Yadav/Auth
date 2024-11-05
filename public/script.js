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
    document.getElementById('protected-content').innerText = `Hello ${data.user.firstName} ${data.user.lastName}. Your date of birth is ${data.user.dob} and your User ID is ${data.user.userId}.`;
  } else if (response.status === 403) {
    alert("Access denied. Token may be expired. Please login again.");
  } else {
    alert("Failed to access protected route.");
  }
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
  } else {
    alert("Failed to retrieve user list.");
  }
}

// Function to display users
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
    listItem.innerText = `User ID: ${user.userId}, Name: ${user.firstName} ${user.lastName}, DOB: ${user.dob}`;
    list.appendChild(listItem);
  });

  userListDiv.appendChild(list);
}
