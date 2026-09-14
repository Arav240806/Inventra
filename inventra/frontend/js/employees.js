document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Employees', 'Employees');
  if (!account) return;

  // NOTE: base path is /api/Employees (capital E) — matches the backend
  // exactly, even though /api/products is lowercase. Inconsistent, but
  // intentional here to match your controller's @RequestMapping.
  const BASE = `${API_BASE_URL}/api/Employees`;

  // Every employee belongs to the logged-in user's organization. Backend
  // /all now accepts an optional organizationId filter — we always pass it
  // so one org never sees another org's staff.
  const ORG_ID = account.organizationId;

  // Only Owner/Manager accounts can delete employee records. This is a
  // frontend-only gate for UX — it hides the option, it does not replace
  // real server-side authorization (the backend should enforce this too).
  const CAN_DELETE_ROLES = ['Owner', 'Manager'];
  const canDelete = CAN_DELETE_ROLES.includes(account.role);

  const pageBanner = document.getElementById('pageBanner');
  const employeesBody = document.getElementById('employeesBody');
  const searchBody = document.getElementById('searchBody');
  const deleteBody = document.getElementById('deleteBody');
  const deleteAllowed = document.getElementById('deleteAllowed');
  const deleteDenied = document.getElementById('deleteDenied');

  const formBanner = document.getElementById('formBanner');
  const employeeForm = document.getElementById('employeeForm');
  const addPanelTitle = document.getElementById('addPanelTitle');
  const formSubmit = document.getElementById('formSubmit');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const fields = [
    'firstName', 'lastName', 'email', 'contactNumber', 'userName', 'password',
    'role', 'status', 'organizationId', 'department', 'joiningDate'
  ];

  let allEmployeesCache = [];

  // --- Tab switching -----------------------------------------------------
  const tabButtons = document.querySelectorAll('.subtab-btn');
  const panels = document.querySelectorAll('.subtab-panel');

  function switchTab(tab) {
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });

    if (tab === 'view') loadEmployees();
    if (tab === 'delete') loadDeleteTab();
    if (tab === 'search') {
      searchBody.innerHTML = '<tr><td colspan="7">Search above to find an employee.</td></tr>';
      document.getElementById('searchInput').value = '';
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Clicking the Add tab directly (not via an Edit link) should always
      // start from a blank form, not whatever was left over from an edit.
      if (btn.dataset.tab === 'add') resetForm();
      switchTab(btn.dataset.tab);
    });
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

  function matchesQuery(emp, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [emp.firstName, emp.lastName, emp.userName, emp.email]
      .map((v) => (v || '').toLowerCase())
      .join(' ');
    return haystack.includes(q);
  }

  // --- Fetch all (shared by View all / Search / Delete) --------------------
  async function fetchAllEmployees() {
    const res = await fetch(`${BASE}/all?organizationId=${ORG_ID}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const employees = await res.json();
    allEmployeesCache = employees;
    return employees;
  }

  // --- View all --------------------------------------------------------------
  function renderViewRow(emp) {
    return `
      <tr>
        <td>${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</td>
        <td>${escapeHtml(emp.email)}</td>
        <td>${escapeHtml(emp.contactNumber)}</td>
        <td>${escapeHtml(emp.userName)}</td>
        <td>${escapeHtml(emp.role)}</td>
        <td>${escapeHtml(emp.status)}</td>
        <td>${emp.organizationId ?? '—'}</td>
        <td>${escapeHtml(emp.department)}</td>
        <td>${escapeHtml(emp.joiningDate)}</td>
        <td class="table-actions">
          <button class="table-action-btn" data-action="edit" data-id="${emp.id}">Edit</button>
        </td>
      </tr>
    `;
  }

  async function loadEmployees() {
    employeesBody.innerHTML = '<tr><td colspan="10">Loading employees...</td></tr>';
    try {
      const employees = await fetchAllEmployees();
      if (employees.length === 0) {
        employeesBody.innerHTML = '<tr><td colspan="10">No employees yet. Use the Add tab to add your first one.</td></tr>';
        return;
      }
      employeesBody.innerHTML = employees.map(renderViewRow).join('');
    } catch (err) {
      employeesBody.innerHTML = '<tr><td colspan="10">Could not load employees. Is the backend running?</td></tr>';
    }
  }

  employeesBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn) return;
    if (btn.dataset.action === 'edit') beginEdit(btn.dataset.id);
  });

  // --- Search --------------------------------------------------------------
  async function runSearch() {
    const query = document.getElementById('searchInput').value;
    searchBody.innerHTML = '<tr><td colspan="7">Searching...</td></tr>';
    try {
      const employees = allEmployeesCache.length ? allEmployeesCache : await fetchAllEmployees();
      const matches = employees.filter((emp) => matchesQuery(emp, query));

      if (matches.length === 0) {
        searchBody.innerHTML = '<tr><td colspan="7">No employees match that search.</td></tr>';
        return;
      }

      searchBody.innerHTML = matches.map((emp) => `
        <tr>
          <td>${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</td>
          <td>${escapeHtml(emp.email)}</td>
          <td>${escapeHtml(emp.contactNumber)}</td>
          <td>${escapeHtml(emp.userName)}</td>
          <td>${escapeHtml(emp.role)}</td>
          <td>${escapeHtml(emp.status)}</td>
          <td class="table-actions">
            <button class="table-action-btn" data-action="edit" data-id="${emp.id}">Edit</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      searchBody.innerHTML = '<tr><td colspan="7">Could not search employees. Is the backend running?</td></tr>';
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

  // --- Delete (Owner / Manager only) ----------------------------------------
  function renderDeleteRow(emp) {
    return `
      <tr>
        <td>${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</td>
        <td>${escapeHtml(emp.email)}</td>
        <td>${escapeHtml(emp.userName)}</td>
        <td>${escapeHtml(emp.role)}</td>
        <td class="table-actions">
          <button class="table-action-btn table-action-danger" data-action="delete" data-id="${emp.id}">Delete</button>
        </td>
      </tr>
    `;
  }

  async function loadDeleteTab() {
    if (!canDelete) {
      deleteAllowed.hidden = true;
      deleteDenied.hidden = false;
      return;
    }
    deleteAllowed.hidden = false;
    deleteDenied.hidden = true;

    deleteBody.innerHTML = '<tr><td colspan="5">Loading employees...</td></tr>';
    try {
      const employees = await fetchAllEmployees();
      if (employees.length === 0) {
        deleteBody.innerHTML = '<tr><td colspan="5">No employees to delete.</td></tr>';
        return;
      }
      deleteBody.innerHTML = employees.map(renderDeleteRow).join('');
    } catch (err) {
      deleteBody.innerHTML = '<tr><td colspan="5">Could not load employees. Is the backend running?</td></tr>';
    }
  }

  document.getElementById('deleteSearchBtn').addEventListener('click', () => {
    const query = document.getElementById('deleteSearchInput').value;
    const matches = allEmployeesCache.filter((emp) => matchesQuery(emp, query));
    deleteBody.innerHTML = matches.length
      ? matches.map(renderDeleteRow).join('')
      : '<tr><td colspan="5">No employees match that search.</td></tr>';
  });
  document.getElementById('deleteSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  deleteBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (!btn || btn.dataset.action !== 'delete') return;
    if (!canDelete) return; // belt-and-suspenders; button shouldn't be visible anyway

    const id = btn.dataset.id;
    if (!confirm('Delete this employee? This cannot be undone.')) return;

    try {
      const res = await fetch(`${BASE}/${id}?organizationId=${ORG_ID}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showPageBanner('Employee deleted.', 'success');
      setTimeout(hidePageBanner, 3000);
      loadDeleteTab();
    } catch (err) {
      showPageBanner('Could not delete that employee.', 'error');
    }
  });

  // --- Add / Edit form -------------------------------------------------------
  function resetForm() {
    hideFormBanner();
    fields.forEach(clearFieldError);
    employeeForm.reset();
    document.getElementById('id').value = '';
    // Organization ID is always the logged-in user's own org — never
    // typed by hand, so it can't be pointed at someone else's org by mistake.
    document.getElementById('organizationId').value = ORG_ID;
    addPanelTitle.textContent = 'Add employee';
    formSubmit.textContent = 'Save employee';
    cancelEditBtn.hidden = true;
  }

  async function beginEdit(id) {
    try {
      const res = await fetch(`${BASE}/${id}?organizationId=${ORG_ID}`);
      if (!res.ok) throw new Error('Not found');
      const employee = await res.json();

      switchTab('add');
      hideFormBanner();
      fields.forEach(clearFieldError);

      addPanelTitle.textContent = 'Edit employee';
      formSubmit.textContent = 'Update employee';
      cancelEditBtn.hidden = false;

      document.getElementById('id').value = employee.id;
      document.getElementById('firstName').value = employee.firstName || '';
      document.getElementById('lastName').value = employee.lastName || '';
      document.getElementById('email').value = employee.email || '';
      document.getElementById('contactNumber').value = employee.contactNumber || '';
      document.getElementById('userName').value = employee.userName || '';
      document.getElementById('password').value = employee.password || '';
      document.getElementById('role').value = employee.role || '';
      document.getElementById('status').value = employee.status || '';
      document.getElementById('organizationId').value = employee.organizationId ?? '';
      document.getElementById('department').value = employee.department || '';
      document.getElementById('joiningDate').value = employee.joiningDate || '';
    } catch (err) {
      showPageBanner('Could not load that employee for editing.', 'error');
    }
  }

  cancelEditBtn.addEventListener('click', resetForm);

  // Prefill the Organization ID field on load, so it's already correct
  // whether the Add tab is opened via a click or the ?action=add param.
  resetForm();

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

    if (data.organizationId && !/^\d+$/.test(String(data.organizationId).trim())) {
      setFieldError('organizationId', 'Enter a valid organization ID');
      valid = false;
    }

    return valid;
  }

  // --- Submit (add or update) ------------------------------------------------
  employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormBanner();

    const formData = new FormData(employeeForm);
    const raw = Object.fromEntries(formData.entries());

    if (!validate(raw)) {
      showFormBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const isEdit = !!raw.id;

    const payload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      contactNumber: raw.contactNumber,
      userName: raw.userName,
      password: raw.password,
      role: raw.role,
      status: raw.status,
      organizationId: Number(raw.organizationId),
      department: raw.department,
      joiningDate: raw.joiningDate
    };
    if (isEdit) payload.id = Number(raw.id);

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
        showPageBanner(isEdit ? 'Employee updated.' : 'Employee added.', 'success');
        setTimeout(hidePageBanner, 3000);
        resetForm();
        switchTab('view');
        return;
      }

      const message = extractErrorMessage(body);
      showFormBanner(message || 'Could not save employee. Please check your details.', 'error');
    } catch (err) {
      showFormBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = isEdit ? 'Update employee' : 'Save employee';
    }
  });

  // --- Initial load ------------------------------------------------------------
  if (params.get('action') !== 'add') loadEmployees();
});