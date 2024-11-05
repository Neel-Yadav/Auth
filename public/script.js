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
