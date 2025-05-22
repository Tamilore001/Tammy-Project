// dashboard.js

// Three demo customers with initial empty balances and empty history
const customers = [
  { name: 'Tammy', balance: 3000, history: [] },
  { name: 'Tyrese', balance: 400, history: [] },
  { name: 'Haliburton', balance: 10000, history: [] },
];

// Grab DOM elements
const balanceDisplay = document.getElementById('balance');
const historyList = document.getElementById('historyList');

const creditAmountInput = document.getElementById('creditAmount');
const debitAmountInput = document.getElementById('debitAmount');
const airtimeAmountInput = document.getElementById('airtimeAmount');
const betAmountInput = document.getElementById('betAmount');

const creditError = document.getElementById('creditError');
const debitError = document.getElementById('debitError');
const airtimeError = document.getElementById('airtimeError');
const betError = document.getElementById('betError');

const logoutBtn = document.getElementById('logoutBtn');
const creditBtn = document.getElementById('creditBtn');
const debitBtn = document.getElementById('debitBtn');
const airtimeBtn = document.getElementById('airtimeBtn');
const betBtn = document.getElementById('betBtn');

let currentUserIndex = null;

// Load logged in user from localStorage
function loadUser() {
  const savedIndex = localStorage.getItem('loggedInUser');
  if (savedIndex === null) {
    alert('No user logged in. Redirecting to login page.');
    window.location.href = 'index.html';
    return;
  }
  currentUserIndex = Number(savedIndex);
  renderUserData();
}

// Render user data on dashboard
function renderUserData() {
  const user = customers[currentUserIndex];
  balanceDisplay.textContent = user.balance.toFixed(2);

  // Clear history
  historyList.innerHTML = '';
  // Add history items
  user.history.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.label}: ₦${item.amount.toFixed(2)}`;
    li.className = item.type === 'credit' ? 'credit' : 'debit';
    historyList.appendChild(li);
  });

  clearErrors();
  clearInputs();
}

// Clear input fields
function clearInputs() {
  creditAmountInput.value = '';
  debitAmountInput.value = '';
  airtimeAmountInput.value = '';
  betAmountInput.value = '';
}

// Clear error messages
function clearErrors() {
  creditError.textContent = '';
  debitError.textContent = '';
  airtimeError.textContent = '';
  betError.textContent = '';
}

// Add transaction to user history and update balance
function addTransaction(type, amount, label) {
  const user = customers[currentUserIndex];
  if (type === 'credit') {
    user.balance += amount;
  } else {
    user.balance -= amount;
  }
  user.history.push({ type, amount, label });
  renderUserData();
}

// Validate input amount (positive number)
function validateAmount(amount, errorElement, errorMessage) {
  if (isNaN(amount) || amount <= 0) {
    errorElement.textContent = errorMessage;
    return false;
  }
  return true;
}

// Transaction handlers
creditBtn.addEventListener('click', function() {
  clearErrors();
  const amount = Number(creditAmountInput.value);
  if (!validateAmount(amount, creditError, 'Enter a positive amount to credit')) return;
  addTransaction('credit', amount, 'Credit');
});

debitBtn.addEventListener('click', function() {
  clearErrors();
  const amount = Number(debitAmountInput.value);
  if (!validateAmount(amount, debitError, 'Enter a positive amount to debit')) return;

  if (amount > customers[currentUserIndex].balance) {
    debitError.textContent = 'Insufficient balance!';
    return;
  }
  addTransaction('debit', amount, 'Debit');
});

airtimeBtn.addEventListener('click', function() {
  clearErrors();
  const amount = Number(airtimeAmountInput.value);
  if (!validateAmount(amount, airtimeError, 'Enter a positive amount for airtime')) return;

  if (amount > customers[currentUserIndex].balance) {
    airtimeError.textContent = 'Insufficient balance for airtime!';
    return;
  }
  addTransaction('debit', amount, 'Airtime Purchase');
});

betBtn.addEventListener('click', function() {
  clearErrors();
  const amount = Number(betAmountInput.value);
  if (!validateAmount(amount, betError, 'Enter a positive amount for betting')) return;

  if (amount > customers[currentUserIndex].balance) {
    betError.textContent = 'Insufficient balance for betting!';
    return;
  }
  addTransaction('debit', amount, 'Betting');
});

// Logout handler
logoutBtn.addEventListener('click', function() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});

loadUser();
