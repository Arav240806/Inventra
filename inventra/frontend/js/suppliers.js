document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Suppliers', 'Suppliers');
  if (!account) return;

  // NOTE: base path is /api/Suppliers (capital S), matching the backend's
  // @RequestMapping exactly. The controller binds directly to the Supplier
  // entity (not SupplierDto) for add/update, so the JSON keys below match
  // the entity's field names: supplierName, companyName, contactNumber,
  // email, gstNumber, city, address, supplierId.
  const BASE = `${API_BASE_URL}/api/Suppliers`;

  // Every supplier belongs to the logged-in user's organization. Backend
  // /all now accepts an optional organizationId filter — we always pass it
  // so one org never sees another org's suppliers.
  const ORG_ID = account.organizationId;

  const fields = [
    'supplierName', 'companyName', 'email', 'contactNumber',
    'gstNumber', 'city', 'address'
  ];

  const pageBanner = document.getElementById('pageBanner');
  const suppliersBody = document.getElementById('suppliersBody');
  const searchBody = document.getElementById('searchBody');
  const deleteBody = document.getElementById('deleteBody');

  const formBanner = document.getElementById('formBanner');
  const supplierForm = document.getElementById('supplierForm');
  const addPanelTitle = document.getElementById('addPanelTitle');
  const formSubmit = document.getElementById('formSubmit');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  let allSuppliersCache = [];

  // --- Tab switching -----------------------------------------------------
  const tabButtons = document.querySelectorAll('.subtab-btn');
  const panels = document.querySelectorAll('.subtab-panel');

  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });

    if (tab === 'view') loadSuppliers();
    if (tab === 'delete') loadDeleteTab();
    if (tab === 'search') {
      searchBody.innerHTML = '<tr><td colspan="6">Search above to find a supplier.</td></tr>';
      document.getElementById('searchInput').value = '';
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // --- Banners / errors ----------------------------------------------------
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

  function clearFieldError(name) {
    const input = document.getElementById(name);
    const err = document.getElementById('err-' + name);
    if (input) input.classList.remove('invalid');
    if (err) err.textContent = '';
  }

  function setFieldError(name, msg) {
    const input = document.getElementById(name);
    const err = document.getElementById('err-' + name);
    if (input) input.classList.add('invalid');
    if (err) err.textContent = msg || 'Invalid value';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function extractErrorMessage(body) {
    if (!body) return null;
    if (typeof body === 'string') return body;
    if (body.message) return body.message;
    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors.map((e) => e.defaultMessage || e.message || `${e.field}: invalid`).join(' ');
    }
    return null;
  }

  function matchesQuery(s, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [s.supplierName, s.companyName, s.city]
      .map((v) => (v || '').toLowerCase())
      .join(' ');
    return haystack.includes(q);
  }

  // --- Fetch all (shared by View all / Search / Delete) --------------------
  async function fetchAllSuppliers() {
    const res = await fetch(`${BASE}/all?organizationId=${ORG_ID}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const suppliers = await res.json();
    allSuppliersCache = suppliers;
    return suppliers;
  }

  // --- View all --------------------------------------------------------------
  function renderViewRow(s) {
    return `
      <tr>
        <td>${escapeHtml(s.supplierName)}</td>
        <td>${escapeHtml(s.companyName)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.contactNumber)}</td>
        <td>${escapeHtml(s.city)}</td>
        <td>${escapeHtml(s.gstNumber)}</td>
        <td>${escapeHtml(s.address)}</td>
        <td class="table-actions">
          <button class="table-action-btn" data-action="edit" data-id="${s.supplierId}">Edit</button>
        </td>
      </tr>
    `;
  }

  async function loadSuppliers() {
    suppliersBody.innerHTML = '<tr><td colspan="8">Loading suppliers...</td></tr>';
    try {
      const suppliers = await fetchAllSuppliers();
      if (suppliers.length === 0) {
        suppliersBody.innerHTML = '<tr><td colspan="8">No suppliers yet. Use the Add tab to add your first one.</td></tr>';
        return;
      }
      suppliersBody.innerHTML = suppliers.map(renderViewRow).join('');
    } catch (err) {
      suppliersBody.innerHTML = '<tr><td colspan="8">Could not load suppliers. Is the backend running?</td></tr>';
    }
  }

  suppliersBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn) return;
    if (btn.dataset.action === 'edit') beginEdit(btn.dataset.id);
  });

  // --- Search --------------------------------------------------------------
  async function runSearch() {
    const query = document.getElementById('searchInput').value;
    searchBody.innerHTML = '<tr><td colspan="6">Searching...</td></tr>';
    try {
      const suppliers = allSuppliersCache.length ? allSuppliersCache : await fetchAllSuppliers();
      const matches = suppliers.filter((s) => matchesQuery(s, query));

      if (matches.length === 0) {
        searchBody.innerHTML = '<tr><td colspan="6">No suppliers match that search.</td></tr>';
        return;
      }

      searchBody.innerHTML = matches.map((s) => `
        <tr>
          <td>${escapeHtml(s.supplierName)}</td>
          <td>${escapeHtml(s.companyName)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.contactNumber)}</td>
          <td>${escapeHtml(s.city)}</td>
          <td class="table-actions">
            <button class="table-action-btn" data-action="edit" data-id="${s.supplierId}">Edit</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      searchBody.innerHTML = '<tr><td colspan="6">Could not search suppliers. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('searchBtn').addEventListener('click', runSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
  });

  searchBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn) return;
    if (btn.dataset.action === 'edit') beginEdit(btn.dataset.id);
  });

  // --- Delete (open to all roles) --------------------------------------------
  function renderDeleteRow(s) {
    return `
      <tr>
        <td>${escapeHtml(s.supplierName)}</td>
        <td>${escapeHtml(s.companyName)}</td>
        <td>${escapeHtml(s.city)}</td>
        <td class="table-actions">
          <button class="table-action-btn table-action-danger" data-action="delete" data-id="${s.supplierId}">Delete</button>
        </td>
      </tr>
    `;
  }

  async function loadDeleteTab() {
    deleteBody.innerHTML = '<tr><td colspan="4">Loading suppliers...</td></tr>';
    try {
      const suppliers = await fetchAllSuppliers();
      if (suppliers.length === 0) {
        deleteBody.innerHTML = '<tr><td colspan="4">No suppliers to delete.</td></tr>';
        return;
      }
      deleteBody.innerHTML = suppliers.map(renderDeleteRow).join('');
    } catch (err) {
      deleteBody.innerHTML = '<tr><td colspan="4">Could not load suppliers. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('deleteSearchBtn').addEventListener('click', () => {
    const query = document.getElementById('deleteSearchInput').value;
    const matches = allSuppliersCache.filter((s) => matchesQuery(s, query));
    deleteBody.innerHTML = matches.length
      ? matches.map(renderDeleteRow).join('')
      : '<tr><td colspan="4">No suppliers match that search.</td></tr>';
  });
  document.getElementById('deleteSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  deleteBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn || btn.dataset.action !== 'delete') return;

    const id = btn.dataset.id;
    if (!confirm('Delete this supplier? This cannot be undone.')) return;

    try {
      const res = await fetch(`${BASE}/${id}?organizationId=${ORG_ID}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showPageBanner('Supplier deleted.', 'success');
      setTimeout(hidePageBanner, 3000);
      loadDeleteTab();
    } catch (err) {
      showPageBanner('Could not delete that supplier.', 'error');
    }
  });

  // --- Add / Edit form -------------------------------------------------------
  function resetForm() {
    hideFormBanner();
    fields.forEach(clearFieldError);
    supplierForm.reset();
    document.getElementById('supplierId').value = '';
    addPanelTitle.textContent = 'Add supplier';
    formSubmit.textContent = 'Save supplier';
    cancelEditBtn.hidden = true;
  }

  async function beginEdit(id) {
    try {
      const res = await fetch(`${BASE}/${id}?organizationId=${ORG_ID}`);
      if (!res.ok) throw new Error('Not found');
      const supplier = await res.json();

      switchTab('add');
      hideFormBanner();
      fields.forEach(clearFieldError);

      addPanelTitle.textContent = 'Edit supplier';
      formSubmit.textContent = 'Update supplier';
      cancelEditBtn.hidden = false;

      document.getElementById('supplierId').value = supplier.supplierId;
      document.getElementById('supplierName').value = supplier.supplierName || '';
      document.getElementById('companyName').value = supplier.companyName || '';
      document.getElementById('email').value = supplier.email || '';
      document.getElementById('contactNumber').value = supplier.contactNumber || '';
      document.getElementById('gstNumber').value = supplier.gstNumber || '';
      document.getElementById('city').value = supplier.city || '';
      document.getElementById('address').value = supplier.address || '';
    } catch (err) {
      showPageBanner('Could not load that supplier for editing.', 'error');
    }
  }

  cancelEditBtn.addEventListener('click', resetForm);

  // Auto-open the Add tab if linked here with ?action=add
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add') switchTab('add');

  // --- Validation --------------------------------------------------------------
  function validate(data) {
    let valid = true;
    fields.forEach(clearFieldError);

    fields.forEach((name) => {
      const value = data[name];
      if (value === undefined || value === null || String(value).trim() === '') {
        setFieldError(name, 'This field is required');
        valid = false;
      }
    });

    if (data.email && data.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email.trim())) {
        setFieldError('email', 'Enter a valid email address');
        valid = false;
      }
    }

    if (data.contactNumber && !/^\d{10}$/.test(data.contactNumber.trim())) {
      setFieldError('contactNumber', 'Must be exactly 10 digits');
      valid = false;
    }

    return valid;
  }

  // --- Submit (add or update) ------------------------------------------------
  supplierForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormBanner();

    const formData = new FormData(supplierForm);
    const raw = Object.fromEntries(formData.entries());

    if (!validate(raw)) {
      showFormBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const isEdit = !!raw.supplierId;

    const payload = {
      supplierName: raw.supplierName,
      companyName: raw.companyName,
      email: raw.email,
      contactNumber: raw.contactNumber,
      gstNumber: raw.gstNumber,
      city: raw.city,
      address: raw.address,
      organizationId: ORG_ID
    };
    if (isEdit) payload.supplierId = Number(raw.supplierId);

    formSubmit.disabled = true;
    formSubmit.textContent = 'Saving...';

    try {
      const url = isEdit ? `${BASE}/update` : `${BASE}/add`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (_) { /* no body */ }

      if (res.ok) {
        showPageBanner(isEdit ? 'Supplier updated.' : 'Supplier added.', 'success');
        setTimeout(hidePageBanner, 3000);
        resetForm();
        switchTab('view');
        return;
      }

      const message = extractErrorMessage(body);
      showFormBanner(message || 'Could not save supplier. Please check your details.', 'error');
    } catch (err) {
      showFormBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = isEdit ? 'Update supplier' : 'Save supplier';
    }
  });

  // --- Initial load ------------------------------------------------------------
  if (params.get('action') !== 'add') loadSuppliers();
});