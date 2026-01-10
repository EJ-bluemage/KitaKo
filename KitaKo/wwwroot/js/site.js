// ==================== KitaKo JavaScript - Complete Application Logic ====================
// Client-side functionality with LocalStorage for data persistence

// ==================== DATA STORAGE ====================

// Initialize data from localStorage
let sales = JSON.parse(localStorage.getItem('kitako_sales')) || [];
let utangs = JSON.parse(localStorage.getItem('kitako_utangs')) || [];

// Refresh in-memory data from localStorage (use before rendering to avoid stale state)
function refreshDataFromStorage() {
    sales = JSON.parse(localStorage.getItem('kitako_sales')) || [];
    utangs = JSON.parse(localStorage.getItem('kitako_utangs')) || [];
}

// Save data to localStorage
function saveSales() {
    localStorage.setItem('kitako_sales', JSON.stringify(sales));
    // notify other listeners/pages in same window
    window.dispatchEvent(new Event('kitako-data-changed'));
}

function saveUtangs() {
    localStorage.setItem('kitako_utangs', JSON.stringify(utangs));
    // notify other listeners/pages in same window
    window.dispatchEvent(new Event('kitako-data-changed'));
}

// ==================== AGING CALCULATION FUNCTIONS ====================

// Calculate how many complete months have passed since due date
function getMonthsOverdue(dueDate, currentDate = new Date()) {
    const due = new Date(dueDate);

    if (currentDate <= due) {
        return 0;
    }

    // Calculate months difference
    let monthsDiff = ((currentDate.getFullYear() - due.getFullYear()) * 12) +
        currentDate.getMonth() - due.getMonth();

    // Only count complete months (if we haven't reached the same day yet)
    if (currentDate.getDate() < due.getDate()) {
        monthsDiff--;
    }

    return Math.max(0, monthsDiff);
}

// Calculate current amount with 5% monthly penalty
function getCurrentAmount(utang, currentDate = new Date()) {
    const monthsOverdue = getMonthsOverdue(utang.dueDate, currentDate);

    // If not yet overdue, return original amount
    if (monthsOverdue === 0) {
        return utang.amount;
    }

    // Apply 5% penalty for each month overdue (compounded)
    const penaltyRate = 0.05;
    let currentAmount = utang.amount;

    for (let i = 0; i < monthsOverdue; i++) {
        currentAmount += currentAmount * penaltyRate;
    }

    return Math.round(currentAmount * 100) / 100; // Round to 2 decimal places
}

// Calculate penalty amount
function getPenaltyAmount(utang, currentDate = new Date()) {
    return getCurrentAmount(utang, currentDate) - utang.amount;
}

// Check if utang is overdue
function isOverdue(dueDate, currentDate = new Date()) {
    return currentDate > new Date(dueDate);
}

// ==================== MODAL FUNCTIONS ====================

function openSaleModal() {
    document.getElementById('saleModal').classList.remove('hidden');
    const el = document.getElementById('saleAmount');
    if (el) el.focus();
}

function closeSaleModal() {
    document.getElementById('saleModal').classList.add('hidden');
    // Clear form
    const amountEl = document.getElementById('saleAmount');
    const profitEl = document.getElementById('saleProfit');
    const descEl = document.getElementById('saleDescription');
    if (amountEl) amountEl.value = '';
    if (profitEl) profitEl.value = '';
    if (descEl) descEl.value = '';
}

function openUtangModal() {
    document.getElementById('utangModal').classList.remove('hidden');
    const el = document.getElementById('utangCustomerName');
    if (el) el.focus();
}

function closeUtangModal() {
    document.getElementById('utangModal').classList.add('hidden');
    // Clear form
    const nameEl = document.getElementById('utangCustomerName');
    const amountEl = document.getElementById('utangAmount');
    const dueEl = document.getElementById('utangDueDate');
    const profitEl = document.getElementById('utangProfit');
    if (nameEl) nameEl.value = '';
    if (amountEl) amountEl.value = '';
    if (dueEl) dueEl.value = '';
    if (profitEl) profitEl.value = '';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const saleModal = document.getElementById('saleModal');
    const utangModal = document.getElementById('utangModal');

    if (event.target === saleModal) {
        closeSaleModal();
    }
    if (event.target === utangModal) {
        closeUtangModal();
    }
}

// ==================== SALE FUNCTIONS ====================

function addSale() {
    const amount = parseFloat(document.getElementById('saleAmount').value);
    const profit = parseFloat(document.getElementById('saleProfit').value);
    const description = document.getElementById('saleDescription').value;

    if (!amount || isNaN(amount) || (!Number.isFinite(profit) && profit !== 0) || isNaN(profit)) {
        alert('Please fill in amount and profit fields');
        return;
    }

    const sale = {
        id: Date.now(),
        amount: amount,
        profit: profit,
        description: description || 'Sale',
        date: new Date().toISOString()
    };

    sales.push(sale);
    saveSales();
    closeSaleModal();

    // Update UI based on current page
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateSalesTracker === 'function') updateSalesTracker();

    showNotification('Sale added successfully!', 'success');
}

function getSalesByPeriod(period) {
    const now = new Date();

    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const diffTime = Math.abs(now - saleDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (period === 'daily') return diffDays <= 1;
        if (period === 'weekly') return diffDays <= 7;
        if (period === 'monthly') return diffDays <= 30;
        return true;
    });
}

// ==================== UTANG FUNCTIONS ====================

function addUtang() {
    const customerNameEl = document.getElementById('utangCustomerName');
    const amountEl = document.getElementById('utangAmount');
    const dueDateEl = document.getElementById('utangDueDate');
    const profitEl = document.getElementById('utangProfit');

    const customerName = customerNameEl ? customerNameEl.value : '';
    const amount = amountEl ? parseFloat(amountEl.value) : NaN;
    const dueDate = dueDateEl ? dueDateEl.value : '';
    const profitInput = profitEl ? profitEl.value : '';
    const profit = profitInput === '' ? 0 : parseFloat(profitInput);

    if (!customerName || !amount || isNaN(amount) || !dueDate) {
        alert('Please fill in customer name, amount and due date');
        return;
    }

    if (profitInput !== '' && (isNaN(profit) || profit < 0)) {
        alert('Potential profit must be a positive number or left empty');
        return;
    }

    const utang = {
        id: Date.now(),
        customerName: customerName,
        amount: amount,
        profit: profit || 0,
        dueDate: dueDate,
        createdDate: new Date().toISOString()
    };

    utangs.push(utang);
    saveUtangs();
    closeUtangModal();

    // Update UI based on current page
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateUtangLogs === 'function') updateUtangLogs();

    showNotification('Utang added successfully!', 'success');
}

function markUtangPaid(id) {
    refreshDataFromStorage();
    const idx = utangs.findIndex(u => u.id === id);
    if (idx === -1) return;

    const utang = utangs[idx];

    // Use the current amount (with aging penalty) when converting to sale
    const currentAmount = getCurrentAmount(utang);

    // Convert utang into a sale record using current amount (with penalties)
    const sale = {
        id: Date.now(),
        amount: currentAmount,
        profit: typeof utang.profit === 'number' ? utang.profit : 0,
        description: `Paid utang - ${utang.customerName}`,
        date: new Date().toISOString()
    };

    // Add sale and remove utang
    sales.push(sale);
    saveSales();

    // remove utang from in-memory then persist
    utangs.splice(idx, 1);
    saveUtangs();

    // Update UI based on current page
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateUtangLogs === 'function') updateUtangLogs();
    if (typeof updateSalesTracker === 'function') updateSalesTracker();

    showNotification('Utang marked as paid and recorded as sale!', 'success');
}

function getUpcomingUtangs() {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    return utangs.filter(utang => {
        const dueDate = new Date(utang.dueDate);
        return dueDate >= today && dueDate <= threeDaysFromNow;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function getUtangStatus(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { status: 'Overdue', class: 'bg-red-100 text-red-600' };
    if (daysUntilDue <= 3) return { status: 'Due Soon', class: 'bg-yellow-100 text-yellow-600' };
    return { status: 'Active', class: 'bg-green-100 text-green-600' };
}

// ==================== DASHBOARD UPDATES ====================

function updateDashboard() {
    refreshDataFromStorage();

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const dailyGoal = 1000;
    const progress = Math.min((totalSales / dailyGoal) * 100, 100);

    // Loss is now derived from outstanding utangs (sum of CURRENT amounts with aging)
    const totalLoss = utangs.reduce((sum, u) => sum + getCurrentAmount(u), 0);

    // Update stats cards
    const totalSalesCountEl = document.getElementById('totalSalesCount');
    const totalSalesAmountEl = document.getElementById('totalSalesAmount');
    const totalProfitEl = document.getElementById('totalProfit');

    if (totalSalesCountEl) totalSalesCountEl.textContent = sales.length;
    if (totalSalesAmountEl) totalSalesAmountEl.textContent = `₱${totalSales.toFixed(2)}`;
    if (totalProfitEl) totalProfitEl.textContent = `₱${totalProfit.toFixed(2)}`;

    // Update Loss card if present on page
    const lossEl = document.getElementById('totalLoss');
    if (lossEl) {
        lossEl.textContent = `₱${totalLoss.toFixed(2)}`;
    }

    // Update progress circle
    const circle = document.getElementById('progressCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 88;
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    const percentEl = document.getElementById('progressPercent');
    if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
    const progressText = document.getElementById('progressText');
    if (progressText) progressText.textContent = `₱${totalSales.toFixed(0)} / ₱${dailyGoal}`;

    // Update upcoming utangs (show current amount with aging)
    const upcomingUtangs = getUpcomingUtangs();
    const utangContainer = document.getElementById('upcomingUtangs');

    if (utangContainer) {
        if (upcomingUtangs.length === 0) {
            utangContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No upcoming utangs</p>';
        } else {
            utangContainer.innerHTML = upcomingUtangs.map(utang => {
                const currentAmount = getCurrentAmount(utang);
                const penalty = getPenaltyAmount(utang);
                const hasAging = penalty > 0;

                return `
                <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg mb-3">
                    <div>
                        <p class="font-semibold text-gray-800">${utang.customerName}</p>
                        <p class="text-sm text-gray-500">
                            ${hasAging ?
                        `<span class="line-through">₱${utang.amount.toFixed(2)}</span> 
                                 <span class="text-red-600 font-bold">₱${currentAmount.toFixed(2)}</span>` :
                        `₱${utang.amount.toFixed(2)}`
                    }
                        </p>
                        ${hasAging ? `<p class="text-xs text-red-500">+₱${penalty.toFixed(2)} penalty</p>` : ''}
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-red-500 font-medium">Due</p>
                        <p class="text-xs text-gray-500">${new Date(utang.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    // Update recent sales
    const recentSales = sales.slice(-5).reverse();
    const recentContainer = document.getElementById('recentSalesContainer');
    const recentList = document.getElementById('recentSalesList');

    if (recentList) {
        if (recentSales.length > 0) {
            if (recentContainer) recentContainer.style.display = 'block';
            recentList.innerHTML = recentSales.map(sale => `
                <div class="flex justify-between items-center p-3 border-b border-gray-100">
                    <div>
                        <p class="font-semibold text-gray-800">${sale.description}</p>
                        <p class="text-sm text-gray-500">₱${sale.amount.toFixed(2)}</p>
                    </div>
                    <p class="text-green-500 font-semibold">+₱${sale.profit.toFixed(2)}</p>
                </div>
            `).join('');
        } else {
            if (recentContainer) recentContainer.style.display = 'none';
        }
    }
}

// ==================== SALES TRACKER UPDATES ====================

function updateSalesTracker() {
    refreshDataFromStorage();

    // Update period stats
    const dailySales = getSalesByPeriod('daily');
    const weeklySales = getSalesByPeriod('weekly');
    const monthlySales = getSalesByPeriod('monthly');

    // Daily stats
    const dailyTotal = dailySales.reduce((sum, s) => sum + s.amount, 0);
    const dailyProfit = dailySales.reduce((sum, s) => sum + s.profit, 0);
    const dailySalesEl = document.getElementById('dailySales');
    const dailyProfitEl = document.getElementById('dailyProfit');
    const dailyCountEl = document.getElementById('dailyCount');
    if (dailySalesEl) dailySalesEl.textContent = `₱${dailyTotal.toFixed(2)}`;
    if (dailyProfitEl) dailyProfitEl.textContent = `Profit: ₱${dailyProfit.toFixed(2)}`;
    if (dailyCountEl) dailyCountEl.textContent = `${dailySales.length} sales`;

    // Weekly stats
    const weeklyTotal = weeklySales.reduce((sum, s) => sum + s.amount, 0);
    const weeklyProfit = weeklySales.reduce((sum, s) => sum + s.profit, 0);
    const weeklySalesEl = document.getElementById('weeklySales');
    const weeklyProfitEl = document.getElementById('weeklyProfit');
    const weeklyCountEl = document.getElementById('weeklyCount');
    if (weeklySalesEl) weeklySalesEl.textContent = `₱${weeklyTotal.toFixed(2)}`;
    if (weeklyProfitEl) weeklyProfitEl.textContent = `Profit: ₱${weeklyProfit.toFixed(2)}`;
    if (weeklyCountEl) weeklyCountEl.textContent = `${weeklySales.length} sales`;

    // Monthly stats
    const monthlyTotal = monthlySales.reduce((sum, s) => sum + s.amount, 0);
    const monthlyProfit = monthlySales.reduce((sum, s) => sum + s.profit, 0);
    const monthlySalesEl = document.getElementById('monthlySales');
    const monthlyProfitEl = document.getElementById('monthlyProfit');
    const monthlyCountEl = document.getElementById('monthlyCount');
    if (monthlySalesEl) monthlySalesEl.textContent = `₱${monthlyTotal.toFixed(2)}`;
    if (monthlyProfitEl) monthlyProfitEl.textContent = `₱${monthlyProfit.toFixed(2)}`;
    if (monthlyCountEl) monthlyCountEl.textContent = `${monthlySales.length} sales`;

    // Update sales history table
    const tableContainer = document.getElementById('salesHistoryTable');

    if (tableContainer) {
        if (sales.length === 0) {
            tableContainer.innerHTML = `<p class="text-gray-400 text-center py-12">No sales recorded yet</p>`;
        } else {
            const sortedSales = [...sales].reverse();
            tableContainer.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-200">
                                <th class="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                                <th class="text-left py-3 px-4 text-gray-600 font-semibold">Description</th>
                                <th class="text-right py-3 px-4 text-gray-600 font-semibold">Amount</th>
                                <th class="text-right py-3 px-4 text-gray-600 font-semibold">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedSales.map(sale => `
                                <tr class="border-b border-gray-100 hover:bg-gray-50">
                                    <td class="py-3 px-4 text-gray-700">${new Date(sale.date).toLocaleDateString()}</td>
                                    <td class="py-3 px-4 text-gray-700">${sale.description}</td>
                                    <td class="py-3 px-4 text-right font-semibold text-gray-800">₱${sale.amount.toFixed(2)}</td>
                                    <td class="py-3 px-4 text-right font-semibold text-green-500">₱${sale.profit.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
}

// ==================== UTANG LOGS UPDATES ====================

function updateUtangLogs() {
    refreshDataFromStorage();

    const tableContainer = document.getElementById('utangTableContainer');

    if (!tableContainer) return;

    if (utangs.length === 0) {
        tableContainer.innerHTML = `
            <div class="bg-white rounded-xl p-12 shadow-md text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-400 text-lg">No utang records yet</p>
                <p class="text-gray-400 text-sm mt-2">Click "Add Utang" to start tracking</p>
            </div>
        `;
    } else {
        const sortedUtangs = [...utangs].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        tableContainer.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                <table class="w-full table-auto">
                    <colgroup>
                        <col style="width:22%">
                        <col style="width:13%">
                        <col style="width:13%">
                        <col style="width:13%">
                        <col style="width:13%">
                        <col style="width:13%">
                        <col style="width:13%">
                    </colgroup>
                    <thead class="bg-orange-500 text-white">
                        <tr>
                            <th class="text-left py-4 px-6 font-semibold">Customer Name</th>
                            <th class="text-right py-4 px-6 font-semibold">Original Amount</th>
                            <th class="text-right py-4 px-6 font-semibold">Current Amount</th>
                            <th class="text-right py-4 px-6 font-semibold">Penalty</th>
                            <th class="text-center py-4 px-6 font-semibold">Due Date</th>
                            <th class="text-center py-4 px-6 font-semibold">Status</th>
                            <th class="text-center py-4 px-6 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedUtangs.map(utang => {
            const status = getUtangStatus(utang.dueDate);
            const currentAmount = getCurrentAmount(utang);
            const penalty = getPenaltyAmount(utang);
            const monthsOverdue = getMonthsOverdue(utang.dueDate);
            const hasAging = penalty > 0;

            return `
                                <tr class="border-b border-gray-100 hover:bg-gray-50">
                                    <td class="py-4 px-6 font-semibold text-gray-800">${utang.customerName}</td>
                                    <td class="py-4 px-6 text-right text-gray-600">₱${utang.amount.toFixed(2)}</td>
                                    <td class="py-4 px-6 text-right font-bold ${hasAging ? 'text-red-600' : 'text-gray-800'}">
                                        ₱${currentAmount.toFixed(2)}
                                        ${hasAging ? `<span class="text-xs block text-red-500">(${monthsOverdue} mo. overdue)</span>` : ''}
                                    </td>
                                    <td class="py-4 px-6 text-right ${hasAging ? 'text-red-600 font-bold' : 'text-gray-500'}">
                                        ${hasAging ? `+₱${penalty.toFixed(2)}` : '₱0.00'}
                                    </td>
                                    <td class="py-4 px-6 text-center text-gray-600">${new Date(utang.dueDate).toLocaleDateString()}</td>
                                    <td class="py-4 px-6 text-center">
                                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${status.class}">
                                            ${status.status}
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <button onclick="markUtangPaid(${utang.id})" 
                                                class="inline-block whitespace-nowrap bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                                            Mark Paid
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                </div>
            </div>
        `;
    }

    // Update summary (use current amounts with aging)
    const totalAmount = utangs.reduce((sum, u) => sum + getCurrentAmount(u), 0);
    const dueSoonCount = getUpcomingUtangs().length;

    const totalUtangCountEl = document.getElementById('totalUtangCount');
    const totalUtangAmountEl = document.getElementById('totalUtangAmount');
    const dueSoonCountEl = document.getElementById('dueSoonCount');

    if (totalUtangCountEl) totalUtangCountEl.textContent = utangs.length;
    if (totalUtangAmountEl) totalUtangAmountEl.textContent = `₱${totalAmount.toFixed(2)}`;
    if (dueSoonCountEl) dueSoonCountEl.textContent = dueSoonCount;
}

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold`;
    notification.textContent = message;
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================

function formatCurrency(amount) {
    return `₱${parseFloat(amount).toFixed(2)}`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-PH', options);
}

// ==================== EVENT SYNC (CROSS-PAGE & IN-APP) ====================

// When other code in same window dispatches 'kitako-data-changed', refresh UI
window.addEventListener('kitako-data-changed', function () {
    // Refresh in-memory first
    refreshDataFromStorage();

    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateUtangLogs === 'function') updateUtangLogs();
    if (typeof updateSalesTracker === 'function') updateSalesTracker();
});

// When localStorage changes in other tabs/windows, update UI here
window.addEventListener('storage', function (e) {
    if (e.key === 'kitako_utangs' || e.key === 'kitako_sales') {
        refreshDataFromStorage();

        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateUtangLogs === 'function') updateUtangLogs();
        if (typeof updateSalesTracker === 'function') updateSalesTracker();
    }
});

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', function (e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        const saleModal = document.getElementById('saleModal');
        const utangModal = document.getElementById('utangModal');

        if (saleModal && !saleModal.classList.contains('hidden')) {
            closeSaleModal();
        }
        if (utangModal && !utangModal.classList.contains('hidden')) {
            closeUtangModal();
        }
    }

    // Ctrl/Cmd + S to open sale modal (if on dashboard/sales page)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saleModal = document.getElementById('saleModal');
        if (saleModal && saleModal.classList.contains('hidden')) {
            openSaleModal();
        }
    }
});

// ==================== EXPORT FUNCTIONS ====================

function exportToCSV(data, filename) {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// ==================== PRINT FUNCTIONS ====================

function printReport(title, content) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #f97316; color: white; }');
    printWindow.document.write('h1 { color: #f97316; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + title + '</h1>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ==================== DATA BACKUP & RESTORE ====================

function backupData() {
    const data = {
        sales: sales,
        utangs: utangs,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `kitako-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Data backed up successfully!', 'success');
}

function restoreData(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.sales) {
                sales = data.sales;
                saveSales();
            }
            if (data.utangs) {
                utangs = data.utangs;
                saveUtangs();
            }

            // Refresh current page
            location.reload();

            showNotification('Data restored successfully!', 'success');
        } catch (error) {
            showNotification('Error restoring data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// ==================== INITIALIZE ON PAGE LOAD ====================

document.addEventListener('DOMContentLoaded', function () {
    console.log('KitaKo initialized');
    console.log('Total Sales:', sales.length);
    console.log('Total Utangs:', utangs.length);
    // Ensure UI reflects stored data on load
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateUtangLogs === 'function') updateUtangLogs();
    if (typeof updateSalesTracker === 'function') updateSalesTracker();
});
// ==================== EXPENSE PRIORITY WITH KNAPSACK ALGORITHM ====================

// Initialize expenses from localStorage
let expenses = JSON.parse(localStorage.getItem('kitako_expenses')) || [];

function saveExpenses() {
    localStorage.setItem('kitako_expenses', JSON.stringify(expenses));
    window.dispatchEvent(new Event('kitako-data-changed'));
}

function refreshExpenses() {
    expenses = JSON.parse(localStorage.getItem('kitako_expenses')) || [];
}

// ==================== KNAPSACK ALGORITHM ====================

/**
 * 0/1 Knapsack algorithm to prioritize expenses based on budget
 * @param {Array} items - Array of expense objects with {id, name, cost, priority, type}
 * @param {Number} budget - Available budget
 * @returns {Object} - Selected expenses and optimization details
 */
function knapsackExpensePriority(items, budget) {
    const n = items.length;

    // Create DP table
    const dp = Array(n + 1).fill(null).map(() => Array(Math.floor(budget) + 1).fill(0));

    // Fill the DP table
    for (let i = 1; i <= n; i++) {
        const item = items[i - 1];
        const cost = Math.floor(item.cost);
        const value = item.priority;

        for (let w = 0; w <= Math.floor(budget); w++) {
            if (cost <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - cost] + value
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Backtrack to find selected items
    const selectedExpenses = [];
    let w = Math.floor(budget);
    let totalCost = 0;
    let totalPriority = 0;

    for (let i = n; i > 0 && w > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            const item = items[i - 1];
            selectedExpenses.push(item);
            totalCost += item.cost;
            totalPriority += item.priority;
            w -= Math.floor(item.cost);
        }
    }

    // Sort by priority (highest first)
    selectedExpenses.sort((a, b) => b.priority - a.priority);

    // Calculate what's left out
    const leftOutExpenses = items.filter(item =>
        !selectedExpenses.find(selected => selected.id === item.id)
    );

    return {
        selected: selectedExpenses,
        leftOut: leftOutExpenses,
        totalCost: totalCost,
        totalPriority: totalPriority,
        remainingBudget: budget - totalCost,
        utilizationRate: ((totalCost / budget) * 100).toFixed(1)
    };
}

// ==================== EXPENSE MANAGEMENT FUNCTIONS ====================

function addExpense() {
    const nameEl = document.getElementById('expenseName');
    const costEl = document.getElementById('expenseCost');
    const priorityEl = document.getElementById('expensePriority');
    const typeEl = document.getElementById('expenseType');
    const dueDateEl = document.getElementById('expenseDueDate');

    const name = nameEl ? nameEl.value : '';
    const cost = costEl ? parseFloat(costEl.value) : NaN;
    const priority = priorityEl ? parseInt(priorityEl.value) : NaN;
    const type = typeEl ? typeEl.value : 'bill';
    const dueDate = dueDateEl ? dueDateEl.value : '';

    if (!name || !cost || isNaN(cost) || !priority || isNaN(priority)) {
        alert('Please fill in all required fields');
        return;
    }

    const expense = {
        id: Date.now(),
        name: name,
        cost: cost,
        priority: priority,
        type: type,
        dueDate: dueDate || null,
        status: 'pending',
        createdDate: new Date().toISOString()
    };

    expenses.push(expense);
    saveExpenses();
    closeExpenseModal();

    if (typeof updateExpensePriority === 'function') updateExpensePriority();

    showNotification('Expense added successfully!', 'success');
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        refreshExpenses();
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses();

        if (typeof updateExpensePriority === 'function') updateExpensePriority();

        showNotification('Expense deleted!', 'success');
    }
}

function markExpensePaid(id) {
    refreshExpenses();
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    expense.status = 'paid';
    expense.paidDate = new Date().toISOString();
    saveExpenses();

    if (typeof updateExpensePriority === 'function') updateExpensePriority();

    showNotification('Expense marked as paid!', 'success');
}

function openExpenseModal() {
    document.getElementById('expenseModal').classList.remove('hidden');
    const el = document.getElementById('expenseName');
    if (el) el.focus();
}

function closeExpenseModal() {
    document.getElementById('expenseModal').classList.add('hidden');
    // Clear form
    const nameEl = document.getElementById('expenseName');
    const costEl = document.getElementById('expenseCost');
    const priorityEl = document.getElementById('expensePriority');
    const typeEl = document.getElementById('expenseType');
    const dueDateEl = document.getElementById('expenseDueDate');

    if (nameEl) nameEl.value = '';
    if (costEl) costEl.value = '';
    if (priorityEl) priorityEl.value = '5';
    if (typeEl) typeEl.value = 'bill';
    if (dueDateEl) dueDateEl.value = '';
}

function runKnapsackOptimization() {
    const budgetEl = document.getElementById('availableBudget');
    const budget = budgetEl ? parseFloat(budgetEl.value) : 0;

    if (!budget || isNaN(budget) || budget <= 0) {
        alert('Please enter a valid budget amount');
        return;
    }

    refreshExpenses();

    // Filter only pending expenses
    const pendingExpenses = expenses.filter(e => e.status === 'pending');

    if (pendingExpenses.length === 0) {
        alert('No pending expenses to optimize');
        return;
    }

    // Run knapsack algorithm
    const result = knapsackExpensePriority(pendingExpenses, budget);

    // Display results
    displayKnapsackResults(result, budget);
}

function displayKnapsackResults(result, budget) {
    const resultsContainer = document.getElementById('knapsackResults');

    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-md mb-6">
            <h3 class="text-2xl font-bold mb-4 text-gray-800">💡 Optimization Results</h3>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Budget</p>
                    <p class="text-2xl font-bold text-green-600">₱${budget.toFixed(2)}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">To Spend</p>
                    <p class="text-2xl font-bold text-blue-600">₱${result.totalCost.toFixed(2)}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Remaining</p>
                    <p class="text-2xl font-bold text-purple-600">₱${result.remainingBudget.toFixed(2)}</p>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Utilization</p>
                    <p class="text-2xl font-bold text-orange-600">${result.utilizationRate}%</p>
                </div>
            </div>
            
            <!-- Selected Expenses -->
            <div class="mb-6">
                <h4 class="text-lg font-bold mb-3 text-green-600">✅ Recommended to Pay (${result.selected.length} items)</h4>
                ${result.selected.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-green-100">
                                <tr>
                                    <th class="text-left py-3 px-4 font-semibold">Name</th>
                                    <th class="text-center py-3 px-4 font-semibold">Type</th>
                                    <th class="text-center py-3 px-4 font-semibold">Priority</th>
                                    <th class="text-right py-3 px-4 font-semibold">Cost</th>
                                    <th class="text-center py-3 px-4 font-semibold">Due Date</th>
                                    <th class="text-center py-3 px-4 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.selected.map((expense, index) => `
                                    <tr class="border-b hover:bg-green-50">
                                        <td class="py-3 px-4 font-semibold">${index + 1}. ${expense.name}</td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-3 py-1 rounded-full text-sm font-semibold ${expense.type === 'bill' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
        }">
                                                ${expense.type === 'bill' ? '📄 Bill' : '📦 Stock'}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-3 py-1 rounded-full text-sm font-bold ${expense.priority >= 8 ? 'bg-red-100 text-red-600' :
            expense.priority >= 5 ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
        }">
                                                ${expense.priority}/10
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right font-bold text-gray-800">₱${expense.cost.toFixed(2)}</td>
                                        <td class="py-3 px-4 text-center text-sm text-gray-600">
                                            ${expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button onclick="markExpensePaid(${expense.id})"
                                                    class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                                                Mark Paid
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-gray-500">No expenses can fit in budget</p>'}
            </div>
            
            <!-- Left Out Expenses -->
            ${result.leftOut.length > 0 ? `
                <div>
                    <h4 class="text-lg font-bold mb-3 text-red-600">⏸️ Can Wait (${result.leftOut.length} items)</h4>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-red-100">
                                <tr>
                                    <th class="text-left py-3 px-4 font-semibold">Name</th>
                                    <th class="text-center py-3 px-4 font-semibold">Type</th>
                                    <th class="text-center py-3 px-4 font-semibold">Priority</th>
                                    <th class="text-right py-3 px-4 font-semibold">Cost</th>
                                    <th class="text-center py-3 px-4 font-semibold">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${result.leftOut.map(expense => `
                                    <tr class="border-b hover:bg-red-50">
                                        <td class="py-3 px-4">${expense.name}</td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-3 py-1 rounded-full text-sm font-semibold ${expense.type === 'bill' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }">
                                                ${expense.type === 'bill' ? '📄 Bill' : '📦 Stock'}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <span class="px-3 py-1 rounded-full text-sm font-bold ${expense.priority >= 8 ? 'bg-red-100 text-red-600' :
                expense.priority >= 5 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
            }">
                                                ${expense.priority}/10
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-right font-bold text-gray-600">₱${expense.cost.toFixed(2)}</td>
                                        <td class="py-3 px-4 text-center text-sm text-gray-600">
                                            ${expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== UPDATE EXPENSE PRIORITY PAGE ====================

function updateExpensePriority() {
    refreshExpenses();

    const expenseListContainer = document.getElementById('expenseListContainer');

    if (!expenseListContainer) return;

    // Separate pending and paid expenses
    const pendingExpenses = expenses.filter(e => e.status === 'pending');
    const paidExpenses = expenses.filter(e => e.status === 'paid');

    if (pendingExpenses.length === 0 && paidExpenses.length === 0) {
        expenseListContainer.innerHTML = `
            <div class="bg-white rounded-xl p-12 shadow-md text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-400 text-lg">No expenses yet</p>
                <p class="text-gray-400 text-sm mt-2">Click "Add Expense" to start tracking</p>
            </div>
        `;
        return;
    }

    // Sort pending by priority (highest first)
    pendingExpenses.sort((a, b) => b.priority - a.priority);

    expenseListContainer.innerHTML = `
        ${pendingExpenses.length > 0 ? `
            <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div class="bg-orange-500 text-white px-6 py-4">
                    <h3 class="text-xl font-bold">📋 Pending Expenses (${pendingExpenses.length})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="text-left py-3 px-4 font-semibold">Name</th>
                                <th class="text-center py-3 px-4 font-semibold">Type</th>
                                <th class="text-center py-3 px-4 font-semibold">Priority</th>
                                <th class="text-right py-3 px-4 font-semibold">Cost</th>
                                <th class="text-center py-3 px-4 font-semibold">Due Date</th>
                                <th class="text-center py-3 px-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingExpenses.map(expense => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-3 px-4 font-semibold text-gray-800">${expense.name}</td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${expense.type === 'bill' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
        }">
                                            ${expense.type === 'bill' ? '📄 Bill' : '📦 Stock'}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-3 py-1 rounded-full text-sm font-bold ${expense.priority >= 8 ? 'bg-red-100 text-red-600' :
            expense.priority >= 5 ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
        }">
                                            ${expense.priority}/10
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-right font-bold text-gray-800">₱${expense.cost.toFixed(2)}</td>
                                    <td class="py-3 px-4 text-center text-sm text-gray-600">
                                        ${expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <button onclick="markExpensePaid(${expense.id})"
                                                class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-2">
                                            Pay
                                        </button>
                                        <button onclick="deleteExpense(${expense.id})"
                                                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
        
        ${paidExpenses.length > 0 ? `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="bg-green-500 text-white px-6 py-4">
                    <h3 class="text-xl font-bold">✅ Paid Expenses (${paidExpenses.length})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="text-left py-3 px-4 font-semibold">Name</th>
                                <th class="text-center py-3 px-4 font-semibold">Type</th>
                                <th class="text-right py-3 px-4 font-semibold">Cost</th>
                                <th class="text-center py-3 px-4 font-semibold">Paid Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paidExpenses.map(expense => `
                                <tr class="border-b hover:bg-gray-50 opacity-60">
                                    <td class="py-3 px-4 text-gray-600">${expense.name}</td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${expense.type === 'bill' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }">
                                            ${expense.type === 'bill' ? '📄 Bill' : '📦 Stock'}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-right text-gray-600">₱${expense.cost.toFixed(2)}</td>
                                    <td class="py-3 px-4 text-center text-sm text-gray-600">
                                        ${expense.paidDate ? new Date(expense.paidDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
    `;

    // Update summary
    const totalPending = pendingExpenses.reduce((sum, e) => sum + e.cost, 0);
    const totalPaid = paidExpenses.reduce((sum, e) => sum + e.cost, 0);

    const totalPendingEl = document.getElementById('totalPendingExpenses');
    const totalPaidEl = document.getElementById('totalPaidExpenses');
    const pendingCountEl = document.getElementById('pendingExpensesCount');

    if (totalPendingEl) totalPendingEl.textContent = `₱${totalPending.toFixed(2)}`;
    if (totalPaidEl) totalPaidEl.textContent = `₱${totalPaid.toFixed(2)}`;
    if (pendingCountEl) pendingCountEl.textContent = pendingExpenses.length;
}
