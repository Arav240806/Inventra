document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Inventory', 'Inventory');
  if (!account) return;

  // Every product belongs to the logged-in user's organization. Backend
  // /all now accepts an optional organizationId filter — we always pass it
  // so one org never sees another org's inventory.
  const ORG_ID = account.organizationId;

  // NOTE: Product's getter/setter is getBarcode()/setBarcode() (lowercase
  // "code"), not getBarCode() like ProductDto. Since the controller binds
  // directly to the Product entity, Jackson serializes this property as
  // "barcode" (all lowercase) — that's the key we send below.
  const fields = [
    'productName', 'brandName', 'category', 'supplierName', 'quantity',
    'purchasePrice', 'sellingPrice', 'manufacturingDate', 'expiryDate',
    'barcode', 'storageLocation'
  ];

  const pageBanner = document.getElementById('pageBanner');
  const productsBody = document.getElementById('productsBody');
  const searchBody = document.getElementById('searchBody');
  const deleteBody = document.getElementById('deleteBody');

  const formBanner = document.getElementById('formBanner');
  const productForm = document.getElementById('productForm');
  const addPanelTitle = document.getElementById('addPanelTitle');
  const formSubmit = document.getElementById('formSubmit');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  let allProductsCache = [];

  // --- Tab switching -----------------------------------------------------
  const tabButtons = document.querySelectorAll('.subtab-btn');
  const panels = document.querySelectorAll('.subtab-panel');

  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });

    if (tab === 'view') loadProducts();
    if (tab === 'delete') loadDeleteTab();
    if (tab === 'search') {
      searchBody.innerHTML = '<tr><td colspan="7">Search above to find a product.</td></tr>';
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

  function matchesQuery(p, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [p.productName, p.brandName, p.category, p.barcode]
      .map((v) => (v || '').toLowerCase())
      .join(' ');
    return haystack.includes(q);
  }

  // --- Fetch all (shared by View all / Search / Delete) --------------------
  async function fetchAllProducts() {
    const res = await fetch(`${API_BASE_URL}/api/products/all?organizationId=${ORG_ID}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const products = await res.json();
    allProductsCache = products;
    return products;
  }

  // --- View all --------------------------------------------------------------
  function renderViewRow(p) {
    return `
      <tr>
        <td>${escapeHtml(p.productName)}</td>
        <td>${escapeHtml(p.brandName)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${escapeHtml(p.supplierName)}</td>
        <td>${p.quantity}</td>
        <td>${p.purchasePrice}</td>
        <td>${p.sellingPrice}</td>
        <td>${escapeHtml(p.expiryDate)}</td>
        <td>${escapeHtml(p.storageLocation)}</td>
        <td class="table-actions">
          <button class="table-action-btn" data-action="edit" data-id="${p.productId}">Edit</button>
        </td>
      </tr>
    `;
  }

  async function loadProducts() {
    productsBody.innerHTML = '<tr><td colspan="10">Loading products...</td></tr>';
    try {
      const products = await fetchAllProducts();
      if (products.length === 0) {
        productsBody.innerHTML = '<tr><td colspan="10">No products yet. Use the Add tab to add your first one.</td></tr>';
        return;
      }
      productsBody.innerHTML = products.map(renderViewRow).join('');
    } catch (err) {
      productsBody.innerHTML = '<tr><td colspan="10">Could not load products. Is the backend running?</td></tr>';
    }
  }

  productsBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn) return;
    if (btn.dataset.action === 'edit') beginEdit(btn.dataset.id);
  });

  // --- Search --------------------------------------------------------------
  async function runSearch() {
    const query = document.getElementById('searchInput').value;
    searchBody.innerHTML = '<tr><td colspan="7">Searching...</td></tr>';
    try {
      const products = allProductsCache.length ? allProductsCache : await fetchAllProducts();
      const matches = products.filter((p) => matchesQuery(p, query));

      if (matches.length === 0) {
        searchBody.innerHTML = '<tr><td colspan="7">No products match that search.</td></tr>';
        return;
      }

      searchBody.innerHTML = matches.map((p) => `
        <tr>
          <td>${escapeHtml(p.productName)}</td>
          <td>${escapeHtml(p.brandName)}</td>
          <td>${escapeHtml(p.category)}</td>
          <td>${escapeHtml(p.supplierName)}</td>
          <td>${p.quantity}</td>
          <td>${escapeHtml(p.expiryDate)}</td>
          <td class="table-actions">
            <button class="table-action-btn" data-action="edit" data-id="${p.productId}">Edit</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      searchBody.innerHTML = '<tr><td colspan="7">Could not search products. Is the backend running?</td></tr>';
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
  function renderDeleteRow(p) {
    return `
      <tr>
        <td>${escapeHtml(p.productName)}</td>
        <td>${escapeHtml(p.brandName)}</td>
        <td>${p.quantity}</td>
        <td>${escapeHtml(p.storageLocation)}</td>
        <td class="table-actions">
          <button class="table-action-btn table-action-danger" data-action="delete" data-id="${p.productId}">Delete</button>
        </td>
      </tr>
    `;
  }

  async function loadDeleteTab() {
    deleteBody.innerHTML = '<tr><td colspan="5">Loading products...</td></tr>';
    try {
      const products = await fetchAllProducts();
      if (products.length === 0) {
        deleteBody.innerHTML = '<tr><td colspan="5">No products to delete.</td></tr>';
        return;
      }
      deleteBody.innerHTML = products.map(renderDeleteRow).join('');
    } catch (err) {
      deleteBody.innerHTML = '<tr><td colspan="5">Could not load products. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('deleteSearchBtn').addEventListener('click', () => {
    const query = document.getElementById('deleteSearchInput').value;
    const matches = allProductsCache.filter((p) => matchesQuery(p, query));
    deleteBody.innerHTML = matches.length
      ? matches.map(renderDeleteRow).join('')
      : '<tr><td colspan="5">No products match that search.</td></tr>';
  });
  document.getElementById('deleteSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  deleteBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn || btn.dataset.action !== 'delete') return;

    const id = btn.dataset.id;
    if (!confirm('Delete this product? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}?organizationId=${ORG_ID}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showPageBanner('Product deleted.', 'success');
      setTimeout(hidePageBanner, 3000);
      loadDeleteTab();
    } catch (err) {
      showPageBanner('Could not delete that product.', 'error');
    }
  });

  // --- Add / Edit form -------------------------------------------------------
  function resetForm() {
    hideFormBanner();
    fields.forEach(clearFieldError);
    productForm.reset();
    document.getElementById('productId').value = '';
    addPanelTitle.textContent = 'Add product';
    formSubmit.textContent = 'Save product';
    cancelEditBtn.hidden = true;
  }

  async function beginEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}?organizationId=${ORG_ID}`);
      if (!res.ok) throw new Error('Not found');
      const product = await res.json();

      switchTab('add');
      hideFormBanner();
      fields.forEach(clearFieldError);

      addPanelTitle.textContent = 'Edit product';
      formSubmit.textContent = 'Update product';
      cancelEditBtn.hidden = false;

      document.getElementById('productId').value = product.productId;
      document.getElementById('productName').value = product.productName || '';
      document.getElementById('brandName').value = product.brandName || '';
      document.getElementById('category').value = product.category || '';
      document.getElementById('supplierName').value = product.supplierName || '';
      document.getElementById('quantity').value = product.quantity ?? '';
      document.getElementById('purchasePrice').value = product.purchasePrice ?? '';
      document.getElementById('sellingPrice').value = product.sellingPrice ?? '';
      document.getElementById('manufacturingDate').value = product.manufacturingDate || '';
      document.getElementById('expiryDate').value = product.expiryDate || '';
      document.getElementById('barcode').value = product.barcode || '';
      document.getElementById('storageLocation').value = product.storageLocation || '';
    } catch (err) {
      showPageBanner('Could not load that product for editing.', 'error');
    }
  }

  cancelEditBtn.addEventListener('click', resetForm);

  // Auto-open the Add tab if the dashboard linked here with ?action=add
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'add') switchTab('add');

  // --- Validation ------------------------------------------------------------
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

    if (data.quantity && Number(data.quantity) < 0) {
      setFieldError('quantity', 'Quantity cannot be negative');
      valid = false;
    }
    if (data.purchasePrice && Number(data.purchasePrice) < 0) {
      setFieldError('purchasePrice', 'Cannot be negative');
      valid = false;
    }
    if (data.sellingPrice && Number(data.sellingPrice) < 0) {
      setFieldError('sellingPrice', 'Cannot be negative');
      valid = false;
    }

    return valid;
  }

  // --- Submit (add or update) -----------------------------------------------
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormBanner();

    const formData = new FormData(productForm);
    const raw = Object.fromEntries(formData.entries());

    if (!validate(raw)) {
      showFormBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const isEdit = !!raw.productId;

    const payload = {
      productName: raw.productName,
      brandName: raw.brandName,
      category: raw.category,
      supplierName: raw.supplierName,
      quantity: Number(raw.quantity),
      purchasePrice: Number(raw.purchasePrice),
      sellingPrice: Number(raw.sellingPrice),
      manufacturingDate: raw.manufacturingDate,
      expiryDate: raw.expiryDate,
      barcode: raw.barcode,
      storageLocation: raw.storageLocation,
      organizationId: ORG_ID
    };
    if (isEdit) payload.productId = Number(raw.productId);

    formSubmit.disabled = true;
    formSubmit.textContent = 'Saving...';

    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/products/update`
        : `${API_BASE_URL}/api/products/add`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await res.json(); } catch (_) { /* no body */ }

      if (res.ok) {
        showPageBanner(isEdit ? 'Product updated.' : 'Product added.', 'success');
        setTimeout(hidePageBanner, 3000);
        resetForm();
        switchTab('view');
        return;
      }

      const message = extractErrorMessage(body);
      showFormBanner(message || 'Could not save product. Please check your details.', 'error');
    } catch (err) {
      showFormBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = isEdit ? 'Update product' : 'Save product';
    }
  });

  // --- Initial load ------------------------------------------------------------
  if (params.get('action') !== 'add') loadProducts();
});