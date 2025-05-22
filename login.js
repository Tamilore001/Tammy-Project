// login.js

document.getElementById('loginBtn').addEventListener('click', function() {
  // Get selected user index
  const userIndex = document.getElementById('userLogin').value;
  // Get email and password (accept any)
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (email === '' || password === '') {
    alert('Please enter email and password.');
    return;
  }

  // Save logged-in user index in localStorage
  localStorage.setItem('loggedInUser', userIndex);

  // Redirect to dashboard page
  window.location.href = 'dashboard.html';
});
