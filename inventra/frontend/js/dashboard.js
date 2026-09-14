document.addEventListener('DOMContentLoaded', async () => {

  const account = Inventra.initShell('Dashboard', 'Dashboard');
  if (!account) return; // initShell already redirected to login.html

  document.getElementById('welcomeHeading').textContent =
    `Welcome back, ${account.username || ''}`.trim();

  // Account has no name field — the real name lives on the Employee record.
  // Fetch it once and upgrade the heading when it arrives.
  fetch(`${API_BASE_URL}/api/Employees/${account.employeeId}?organizationId=${account.organizationId}`)
    .then((r) => r.ok ? r.json() : null)
    .then((employee) => {
      if (employee && employee.firstName) {
        document.getElementById('welcomeHeading').textContent = `Welcome back, ${employee.firstName}`;
      }
    })
    .catch(() => { /* keep the username fallback */ });

  // A frontend-only threshold — the Product entity has no reorder-point
  // field, so "low stock" is defined here rather than by the backend.
  // Change this if you add a real threshold field later.
  const LOW_STOCK_THRESHOLD = 10;

  // --- Products: real data from ProductController ------------------------
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/all?organizationId=${account.organizationId}`);
    if (!res.ok) throw new Error(`Products request failed: ${res.status}`);
    const products = await res.json();

    document.getElementById('statProducts').textContent = products.length;

    const lowStockItems = products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD);
    document.getElementById('statLowStock').textContent = lowStockItems.length;
    if (lowStockItems.length > 0) {
      document.getElementById('notifBadge').hidden = false;
    }

    const lowStockBody = document.getElementById('lowStockBody');
    lowStockBody.innerHTML = '';
    if (lowStockItems.length === 0) {
      lowStockBody.innerHTML = '<tr><td colspan="4">No products below the stock threshold.</td></tr>';
    } else {
      lowStockItems.forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(p.productName)}</td>
          <td class="stock-low">${p.quantity}</td>
          <td>${LOW_STOCK_THRESHOLD}</td>
          <td>${escapeHtml(p.supplierName || '—')}</td>
        `;
        lowStockBody.appendChild(tr);
      });
    }
  } catch (err) {
    document.getElementById('statProducts').textContent = '—';
    document.getElementById('statLowStock').textContent = '—';
    document.getElementById('lowStockBody').innerHTML =
      '<tr><td colspan="4">Could not load product data. Is the backend running?</td></tr>';
  }

  // --- Sales: real data from SaleController -------------------------------
  try {
    const res = await fetch(`${API_BASE_URL}/api/sales/all?organizationId=${account.organizationId}`);
    if (!res.ok) throw new Error(`Sales request failed: ${res.status}`);
    const sales = await res.json();

    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    document.getElementById('statSales').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;

    const recent = [...sales]
      .sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''))
      .slice(0, 6);

    if (recent.length === 0) {
      document.getElementById('chartContainer').innerHTML =
        '<p class="empty-state">No sales recorded yet. Record one from the Sales page.</p>';
    } else {
      document.getElementById('chartContainer').innerHTML = `
        <table class="data-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            ${recent.map((s) => `
              <tr>
                <td>${escapeHtml(s.productName)}</td>
                <td>${s.quantitySold}</td>
                <td>₹${(s.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td>${escapeHtml(s.saleDate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  } catch (err) {
    document.getElementById('statSales').textContent = '—';
    document.getElementById('chartContainer').innerHTML =
      '<p class="empty-state">Could not load sales data. Is the backend running?</p>';
  }

  // =====================================================================
  // Purchases still not built — honest placeholder stays.
  // =====================================================================

  document.getElementById('statPurchases').textContent = 'N/A';

  document.getElementById('activityList').innerHTML =
    '<li class="empty-state">No activity feed yet — this needs an activity/audit endpoint.</li>';

  // --- Quick actions -------------------------------------------------------
  document.querySelectorAll('.qa-btn').forEach((btn) => {
    const action = btn.dataset.action;
    if (action === 'add-product') {
      btn.addEventListener('click', () => {
        window.location.href = 'inventory.html?action=add';
      });
    } else if (action === 'add-supplier') {
      btn.addEventListener('click', () => {
        window.location.href = 'suppliers.html?action=add';
      });
    } else if (action === 'record-sale') {
      btn.addEventListener('click', () => {
        window.location.href = 'sales.html?action=add';
      });
    } else {
      btn.addEventListener('click', () => {
        alert(`"${btn.textContent.trim()}" isn't wired up yet — that module hasn't been built.`);
      });
    }
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
});