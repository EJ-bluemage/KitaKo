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

// ==================== DAILY GOAL PERSISTENCE ====================

function getDailyGoal() {
    const raw = localStorage.getItem('kitako_daily_goal');
    const n = parseFloat(raw);
    if (!isFinite(n) || n <= 0) return 1000;
    return n;
}

function setDailyGoal(value) {
    localStorage.setItem('kitako_daily_goal', String(value));
    // notify other listeners/pages in same window
    window.dispatchEvent(new Event('kitako-data-changed'));
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

// Goal modal handlers
function openGoalModal() {
    const modal = document.getElementById('goalModal');
    if (!modal) return;
    const input = document.getElementById('dailyGoalInput');
    if (input) input.value = getDailyGoal();
    modal.classList.remove('hidden');
    if (input) input.focus();
}

function closeGoalModal() {
    const modal = document.getElementById('goalModal');
    if (!modal) return;
    modal.classList.add('hidden');
}

// Save daily goal from modal
function saveDailyGoal() {
    const input = document.getElementById('dailyGoalInput');
    if (!input) return;
    const val = parseFloat(input.value);
    if (!isFinite(val) || val <= 0) {
        alert('Please enter a valid positive number for the daily goal.');
        input.focus();
        return;
    }
    setDailyGoal(val);
    closeGoalModal();
    showNotification('Daily goal updated', 'success');

    // Update UI immediately
    if (typeof updateDashboard === 'function') updateDashboard();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const saleModal = document.getElementById('saleModal');
    const utangModal = document.getElementById('utangModal');
    const goalModal = document.getElementById('goalModal');

    if (event.target === saleModal) {
        closeSaleModal();
    }
    if (event.target === utangModal) {
        closeUtangModal();
    }
    if (event.target === goalModal) {
        closeGoalModal();
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
    // No confirmation prompt — marking as paid immediately converts utang into a sale
    refreshDataFromStorage(); // ensure we're using latest state
    const idx = utangs.findIndex(u => u.id === id);
    if (idx === -1) return;

    const utang = utangs[idx];

    // Convert utang into a sale record using stored profit
    const sale = {
        id: Date.now(),
        amount: utang.amount,
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
    const dailyGoal = getDailyGoal();
    const progress = Math.min((totalSales / dailyGoal) * 100, 100);

    // Loss is now derived from outstanding utangs (sum of amounts)
    const totalLoss = utangs.reduce((sum, u) => sum + u.amount, 0);

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
    if (progressText) progressText.textContent = `₱${totalSales.toFixed(0)} / ₱${Number(dailyGoal).toFixed(0)}`;

    // Update upcoming utangs
    const upcomingUtangs = getUpcomingUtangs();
    const utangContainer = document.getElementById('upcomingUtangs');

    if (utangContainer) {
        if (upcomingUtangs.length === 0) {
            utangContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No upcoming utangs</p>';
        } else {
            utangContainer.innerHTML = upcomingUtangs.map(utang => `
                <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg mb-3">
                    <div>
                        <p class="font-semibold text-gray-800">${utang.customerName}</p>
                        <p class="text-sm text-gray-500">₱${utang.amount.toFixed(2)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-red-500 font-medium">Due</p>
                        <p class="text-xs text-gray-500">${new Date(utang.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('');
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
    if (monthlyProfitEl) monthlyProfitEl.textContent = `Profit: ₱${monthlyProfit.toFixed(2)}`;
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
                        <col style="width:28%">
                        <col style="width:14%">
                        <col style="width:14%">
                        <col style="width:18%">
                        <col style="width:13%">
                        <col style="width:13%">
                    </colgroup>
                    <thead class="bg-orange-500 text-white">
                        <tr>
                            <th class="text-left py-4 px-6 font-semibold">Customer Name</th>
                            <th class="text-right py-4 px-6 font-semibold">Amount</th>
                            <th class="text-right py-4 px-6 font-semibold">Potential Profit</th>
                            <th class="text-center py-4 px-6 font-semibold">Due Date</th>
                            <th class="text-center py-4 px-6 font-semibold">Status</th>
                            <th class="text-center py-4 px-6 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedUtangs.map(utang => {
            const status = getUtangStatus(utang.dueDate);
            const profitDisplay = typeof utang.profit === 'number' ? `₱${utang.profit.toFixed(2)}` : '₱0.00';
            return `
                                <tr class="border-b border-gray-100 hover:bg-gray-50">
                                    <td class="py-4 px-6 font-semibold text-gray-800">${utang.customerName}</td>
                                    <td class="py-4 px-6 text-right font-semibold text-gray-800">₱${utang.amount.toFixed(2)}</td>
                                    <td class="py-4 px-6 text-right text-gray-700 font-medium">${profitDisplay}</td>
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

    // Update summary
    const totalAmount = utangs.reduce((sum, u) => sum + u.amount, 0);
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
    if (e.key === 'kitako_utangs' || e.key === 'kitako_sales' || e.key === 'kitako_daily_goal') {
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
        const goalModal = document.getElementById('goalModal');

        if (saleModal && !saleModal.classList.contains('hidden')) {
            closeSaleModal();
        }
        if (utangModal && !utangModal.classList.contains('hidden')) {
            closeUtangModal();
        }
        if (goalModal && !goalModal.classList.contains('hidden')) {
            closeGoalModal();
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