document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Reports', 'Reports');
  if (!account) return;

  const ORG_ID = account.organizationId;
  const LOW_STOCK_THRESHOLD = 10; // same convention as dashboard.js — no reorder-point field on Product yet

  const pageBanner = document.getElementById('pageBanner');
  function showPageBanner(text, type) {
    pageBanner.textContent = text;
    pageBanner.className = 'form-banner ' + type;
    pageBanner.hidden = false;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // --- Header ------------------------------------------------------------
  document.getElementById('reportMeta').textContent =
    `Organization #${ORG_ID} · Generated ${new Date().toLocaleString()} · Prepared for ${account.username || 'Owner'}`;

  // --- Fetch everything in parallel --------------------------------------
  async function loadReport() {
    try {
      const [products, employees, suppliers, sales] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products/all?organizationId=${ORG_ID}`).then((r) => {
          if (!r.ok) throw new Error('products failed');
          return r.json();
        }),
        fetch(`${API_BASE_URL}/api/Employees/all?organizationId=${ORG_ID}`).then((r) => {
          if (!r.ok) throw new Error('employees failed');
          return r.json();
        }),
        fetch(`${API_BASE_URL}/api/Suppliers/all?organizationId=${ORG_ID}`).then((r) => {
          if (!r.ok) throw new Error('suppliers failed');
          return r.json();
        }),
        fetch(`${API_BASE_URL}/api/sales/all?organizationId=${ORG_ID}`).then((r) => {
          if (!r.ok) throw new Error('sales failed');
          return r.json();
        })
      ]);

      renderInventory(products);
      renderEmployees(employees);
      renderSuppliers(suppliers);
      renderSales(sales);
    } catch (err) {
      showPageBanner('Could not load report data. Is the backend running?', 'error');
    }
  }

  // --- Inventory -----------------------------------------------------------
  function renderInventory(products) {
    const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const lowStock = products.filter((p) => (p.quantity || 0) < LOW_STOCK_THRESHOLD);

    document.getElementById('statTotalProducts').textContent = products.length;
    document.getElementById('statTotalStock').textContent = totalStock;
    document.getElementById('statLowStock').textContent = lowStock.length;

    const lowStockBody = document.getElementById('lowStockBody');
    lowStockBody.innerHTML = lowStock.length
      ? lowStock.map((p) => `
          <tr>
            <td>${escapeHtml(p.productName)}</td>
            <td>${escapeHtml(p.brandName)}</td>
            <td>${p.quantity}</td>
            <td>${escapeHtml(p.supplierName)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4">No low stock items.</td></tr>';

    const allProductsBody = document.getElementById('allProductsBody');
    allProductsBody.innerHTML = products.length
      ? products.map((p) => `
          <tr>
            <td>${escapeHtml(p.productName)}</td>
            <td>${escapeHtml(p.brandName)}</td>
            <td>${escapeHtml(p.category)}</td>
            <td>${p.quantity}</td>
            <td>${p.purchasePrice}</td>
            <td>${p.sellingPrice}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="6">No products yet.</td></tr>';
  }

  // --- Employees -----------------------------------------------------------
  function renderEmployees(employees) {
    document.getElementById('statTotalEmployees').textContent = employees.length;

    const employeesBody = document.getElementById('employeesBody');
    employeesBody.innerHTML = employees.length
      ? employees.map((e) => `
          <tr>
            <td>${escapeHtml(e.firstName)} ${escapeHtml(e.lastName)}</td>
            <td>${escapeHtml(e.role)}</td>
            <td>${escapeHtml(e.status)}</td>
            <td>${escapeHtml(e.department)}</td>
            <td>${escapeHtml(e.joiningDate)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5">No employees yet.</td></tr>';
  }

  // --- Suppliers -----------------------------------------------------------
  function renderSuppliers(suppliers) {
    document.getElementById('statTotalSuppliers').textContent = suppliers.length;

    const suppliersBody = document.getElementById('suppliersBody');
    suppliersBody.innerHTML = suppliers.length
      ? suppliers.map((s) => `
          <tr>
            <td>${escapeHtml(s.supplierName)}</td>
            <td>${escapeHtml(s.companyName)}</td>
            <td>${escapeHtml(s.city)}</td>
            <td>${escapeHtml(s.contactNumber)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4">No suppliers yet.</td></tr>';
  }

  // --- Sales -----------------------------------------------------------------
  function renderSales(sales) {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const unitsSold = sales.reduce((sum, s) => sum + (s.quantitySold || 0), 0);

    document.getElementById('salesStatsRow').innerHTML = `
      <div class="report-stat">
        <span class="report-stat-value">${sales.length}</span>
        <span class="report-stat-label">Transactions</span>
      </div>
      <div class="report-stat">
        <span class="report-stat-value">${unitsSold}</span>
        <span class="report-stat-label">Units sold</span>
      </div>
      <div class="report-stat">
        <span class="report-stat-value">₹${totalRevenue.toLocaleString('en-IN')}</span>
        <span class="report-stat-label">Total revenue</span>
      </div>
    `;

    const salesBody = document.getElementById('salesBody');
    salesBody.innerHTML = sales.length
      ? sales.map((s) => `
          <tr>
            <td>${escapeHtml(s.productName)}</td>
            <td>${s.quantitySold}</td>
            <td>₹${s.sellingPrice}</td>
            <td>₹${s.totalAmount}</td>
            <td>${escapeHtml(s.saleDate)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5">No sales recorded yet.</td></tr>';
  }

  // --- Print / Save as PDF ---------------------------------------------------
  document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
  });

  loadReport();
});