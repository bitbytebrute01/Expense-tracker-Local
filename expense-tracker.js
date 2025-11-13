let transactions = [];
let currentFilter = 'all';

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const transactionListEl = document.getElementById('transaction-list');

const transactionNameInput = document.getElementById('transaction-name');
const transactionAmountInput = document.getElementById('transaction-amount');
const transactionTypeSelect = document.getElementById('transaction-type');
const transactionCategorySelect = document.getElementById('transaction-category');
const searchInput = document.getElementById('search-input');

/* ================= LOAD & SAVE ================= */

function loadTransactions() {
    const stored = localStorage.getItem('transactions');
    if (stored) {
        transactions = JSON.parse(stored);
        updateUI();
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

/* ================= ADD TRANSACTION ================= */

function addTransaction() {
    const name = transactionNameInput.value.trim();
    const amount = parseFloat(transactionAmountInput.value);
    const type = transactionTypeSelect.value;
    const category = transactionCategorySelect.value;

    if (name === '') return alert('Please enter a transaction name!');
    if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount!');

    const transaction = {
        id: generateId(),
        name,
        amount,
        type,
        category,
        date: getCurrentDate()
    };

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    clearForm();
}

/* ================= DELETE TRANSACTION ================= */

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Make deleteTransaction accessible to onclick=""
window.deleteTransaction = deleteTransaction;

/* ================= CLEAR ALL ================= */

function clearAllTransactions() {
    if (transactions.length === 0) return alert('No transactions to clear!');

    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        saveTransactions();
        updateUI();
    }
}

/* ================= TOTALS ================= */

function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
}

/* ================= UPDATE UI ================= */

function updateUI() {
    const { income, expenses, balance } = calculateTotals();

    // Display totals
    incomeEl.textContent = formatCurrency(income);
    expensesEl.textContent = formatCurrency(expenses);

    // Show negative balance
    balanceEl.textContent = formatCurrency(balance);

    // Add a red color class if negative
    if (balance < 0) {
        balanceEl.classList.add('negative');
    } else {
        balanceEl.classList.remove('negative');
    }

    displayTransactions();
}

/* ================= DISPLAY TRANSACTIONS ================= */

function displayTransactions() {
    const filtered = getFilteredTransactions();
    transactionListEl.innerHTML = '';

    if (filtered.length === 0) {
        transactionListEl.innerHTML = `
            <div class="empty-state">
                <p>No transactions found.</p>
            </div>
        `;
        return;
    }

    filtered.sort((a, b) => b.id - a.id);

    filtered.forEach(t => {
        const el = createTransactionElement(t);
        transactionListEl.appendChild(el);
    });
}

/* ================= CREATE DOM ELEMENT FOR TRANSACTION ================= */

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';

    const sign = transaction.type === 'income' ? '+' : '-';
    const amountClass = transaction.type === 'income' ? 'positive' : 'negative';

    div.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-name">${escapeHtml(transaction.name)}</div>
            <span class="transaction-category">${transaction.category}</span>
            <span class="transaction-date">${transaction.date}</span>
        </div>

        <div class="transaction-amount ${amountClass}">
            ${sign}${formatCurrency(transaction.amount)}
        </div>

        <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
    `;

    return div;
}

/* ================= FILTERING ================= */

function filterTransactions(filter) {
    currentFilter = filter;

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    updateUI();
}

function searchTransactions() {
    updateUI();
}

function getFilteredTransactions() {
    const q = searchInput.value.trim().toLowerCase();

    return transactions.filter(t => {
        const matchesType = (currentFilter === 'all' || t.type === currentFilter);
        const matchesSearch =
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q);

        return matchesType && matchesSearch;
    });
}

/* ================= HELPERS ================= */

function generateId() {
    return Date.now();
}

function getCurrentDate() {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    const abs = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-₹${abs}` : `₹${abs}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearForm() {
    transactionNameInput.value = '';
    transactionAmountInput.value = '';
    transactionTypeSelect.value = 'expense';
    transactionCategorySelect.value = 'Food';
}

/* ================= INIT ================= */

loadTransactions();