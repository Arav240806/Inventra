document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Sales', 'Sales');
  if (!account) return;

  const BASE = `${API_BASE_URL}/api/sales`;
  const ORG_ID = account.organizationId;

  const pageBanner = document.getElementById('pageBanner');
  const salesBody = document.getElementById('salesBody');
  const searchBody = document.getElementById('searchBody');
  const deleteBody = document.getElementById('deleteBody');

  const formBanner = document.getElementById('formBanner');
  const saleForm = document.getElementById('saleForm');
  const formSubmit = document.getElementById('formSubmit');
  const productSelect = document.getElementById('productId');
  const stockHint = document.getElementById('stockHint');
  const quantityInput = document.getElementById('quantitySold');
  const saleDateInput = document.getElementById('saleDate');

  let allSalesCache = [];
  let productsCache = [];

  // --- Tab switching -----------------------------------------------------
  const tabButtons = document.querySelectorAll('.subtab-btn');
  const panels = document.querySelectorAll('.subtab-panel');

  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });

    if (tab === 'view') loadSales();
    if (tab === 'delete') loadDeleteTab();
    if (tab === 'add') loadProductsForForm();
    if (tab === 'search') {
      searchBody.innerHTML = '<tr><td colspan="5">Search above to find a sale.</td></tr>';
      document.getElementById('searchInput').value = '';
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // --- Banners / helpers ----------------------------------------------------
  function showPageBanner(text, type) {
    pageBanner.textContent = text;
    pageBanner.className = 'form-banner ' + type;
    pageBanner.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function hidePageBanner() { pageBanner.hidden = true; }

  function showFormBanner(text, type) {
    formBanner.textContent = text;
    formBanner.className = 'form-banner ' + type;
    formBanner.hidden = false;
  }
  function hideFormBanner() { formBanner.hidden = true; }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function extractErrorMessage(body) {
    if (!body) return null;
    if (typeof body === 'string') return body;
    if (body.message) return body.message;
    return null;
  }

  function matchesQuery(s, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (s.productName || '').toLowerCase().includes(q);
  }

  // --- Fetch all sales -------------------------------------------------------
  async function fetchAllSales() {
    const res = await fetch(`${BASE}/all?organizationId=${ORG_ID}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const sales = await res.json();
    allSalesCache = sales;
    return sales;
  }

  // --- View all --------------------------------------------------------------
  function renderRow(s, withDelete) {
    return `
      <tr>
        <td>${escapeHtml(s.productName)}</td>
        <td>${s.quantitySold}</td>
        ${withDelete ? '' : `<td>₹${s.sellingPrice}</td>`}
        <td>₹${s.totalAmount}</td>
        <td>${escapeHtml(s.saleDate)}</td>
        ${withDelete ? `<td class="table-actions"><button class="table-action-btn table-action-danger" data-action="delete" data-id="${s.saleId}">Delete</button></td>` : ''}
      </tr>
    `;
  }

  async function loadSales() {
    salesBody.innerHTML = '<tr><td colspan="6">Loading sales...</td></tr>';
    try {
      const sales = await fetchAllSales();
      if (sales.length === 0) {
        salesBody.innerHTML = '<tr><td colspan="6">No sales recorded yet. Use the Add tab to record your first one.</td></tr>';
        return;
      }
      salesBody.innerHTML = sales.map((s) => `
        <tr>
          <td>${escapeHtml(s.productName)}</td>
          <td>${s.quantitySold}</td>
          <td>₹${s.sellingPrice}</td>
          <td>₹${s.totalAmount}</td>
          <td>${escapeHtml(s.saleDate)}</td>
          <td></td>
        </tr>
      `).join('');
    } catch (err) {
      salesBody.innerHTML = '<tr><td colspan="6">Could not load sales. Is the backend running?</td></tr>';
    }
  }

  // --- Search --------------------------------------------------------------
  async function runSearch() {
    const query = document.getElementById('searchInput').value;
    searchBody.innerHTML = '<tr><td colspan="5">Searching...</td></tr>';
    try {
      const sales = allSalesCache.length ? allSalesCache : await fetchAllSales();
      const matches = sales.filter((s) => matchesQuery(s, query));

      searchBody.innerHTML = matches.length
        ? matches.map((s) => `
            <tr>
              <td>${escapeHtml(s.productName)}</td>
              <td>${s.quantitySold}</td>
              <td>₹${s.sellingPrice}</td>
              <td>₹${s.totalAmount}</td>
              <td>${escapeHtml(s.saleDate)}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="5">No sales match that search.</td></tr>';
    } catch (err) {
      searchBody.innerHTML = '<tr><td colspan="5">Could not search sales. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('searchBtn').addEventListener('click', runSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
  });

  // --- Delete --------------------------------------------------------------
  function renderDeleteRow(s) {
    return `
      <tr>
        <td>${escapeHtml(s.productName)}</td>
        <td>${s.quantitySold}</td>
        <td>₹${s.totalAmount}</td>
        <td>${escapeHtml(s.saleDate)}</td>
        <td class="table-actions">
          <button class="table-action-btn table-action-danger" data-action="delete" data-id="${s.saleId}">Delete</button>
        </td>
      </tr>
    `;
  }

  async function loadDeleteTab() {
    deleteBody.innerHTML = '<tr><td colspan="5">Loading sales...</td></tr>';
    try {
      const sales = await fetchAllSales();
      deleteBody.innerHTML = sales.length
        ? sales.map(renderDeleteRow).join('')
        : '<tr><td colspan="5">No sales to delete.</td></tr>';
    } catch (err) {
      deleteBody.innerHTML = '<tr><td colspan="5">Could not load sales. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('deleteSearchBtn').addEventListener('click', () => {
    const query = document.getElementById('deleteSearchInput').value;
    const matches = allSalesCache.filter((s) => matchesQuery(s, query));
    deleteBody.innerHTML = matches.length
      ? matches.map(renderDeleteRow).join('')
      : '<tr><td colspan="5">No sales match that search.</td></tr>';
  });

  deleteBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn || btn.dataset.action !== 'delete') return;

    const id = btn.dataset.id;
    if (!confirm('Delete this sale record? Stock will NOT be restored automatically.')) return;

    try {
      const res = await fetch(`${BASE}/${id}?organizationId=${ORG_ID}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showPageBanner('Sale deleted.', 'success');
      setTimeout(hidePageBanner, 3000);
      loadDeleteTab();
    } catch (err) {
      showPageBanner('Could not delete that sale.', 'error');
    }
  });

  // --- Add form: load products for the dropdown -------------------------------
  async function loadProductsForForm() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/all?organizationId=${ORG_ID}`);
      if (!res.ok) throw new Error('products failed');
      productsCache = await res.json();

      productSelect.innerHTML = '<option value="" disabled selected>Select a product</option>' +
        productsCache.map((p) => `<option value="${p.productId}">${escapeHtml(p.productName)} (${p.quantity} in stock)</option>`).join('');
    } catch (err) {
      productSelect.innerHTML = '<option value="" disabled selected>Could not load products</option>';
    }

    if (!saleDateInput.value) {
      saleDateInput.value = new Date().toISOString().slice(0, 10);
    }
  }

  productSelect.addEventListener('change', () => {
    const product = productsCache.find((p) => String(p.productId) === productSelect.value);
    stockHint.textContent = product ? `${product.quantity} currently in stock, at ₹${product.sellingPrice} each.` : '';
    if (product) quantityInput.max = product.quantity;
  });

  // Auto-open the Add tab if the dashboard linked here with ?action=add
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add') switchTab('add');

  // --- Submit ------------------------------------------------------------------
  saleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormBanner();

    const productId = productSelect.value;
    const quantitySold = Number(quantityInput.value);
    const saleDate = saleDateInput.value;

    if (!productId) {
      showFormBanner('Please select a product.', 'error');
      return;
    }
    if (!quantitySold || quantitySold < 1) {
      showFormBanner('Enter a quantity of at least 1.', 'error');
      return;
    }

    const payload = {
      organizationId: ORG_ID,
      productId: Number(productId),
      quantitySold,
      saleDate,
      employeeId: account.employeeId
    };

    formSubmit.disabled = true;
    formSubmit.textContent = 'Recording...';

    try {
      const res = await fetch(`${BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (_) { /* no body */ }

      if (res.ok) {
        showPageBanner('Sale recorded — stock updated.', 'success');
        setTimeout(hidePageBanner, 3000);
        saleForm.reset();
        stockHint.textContent = '';
        switchTab('view');
        return;
      }

      const message = extractErrorMessage(body);
      showFormBanner(message || 'Could not record sale. Check the quantity against available stock.', 'error');
    } catch (err) {
      showFormBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = 'Record sale';
    }
  });

  // --- Initial load ------------------------------------------------------------
  if (params.get('action') !== 'add') loadSales();
});