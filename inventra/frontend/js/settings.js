document.addEventListener('DOMContentLoaded', () => {
  const account = Inventra.initShell('Settings', 'Settings');
  if (!account) return;

  const ORG_ID = account.organizationId;

  const pageBanner = document.getElementById('pageBanner');
  function showPageBanner(text, type) {
    pageBanner.textContent = text;
    pageBanner.className = 'form-banner ' + type;
    pageBanner.hidden = false;
  }

  // --- Account info (from session, no fetch needed) -----------------------
  document.getElementById('infoUsername').textContent = account.username || '—';
  document.getElementById('infoRole').textContent = account.role || '—';
  document.getElementById('infoEmployeeId').textContent = account.employeeId ?? '—';
  document.getElementById('infoOrgId').textContent = account.organizationId ?? '—';

  // Full name lives on the Employee record, not the Account — fetch it.
  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Employees/${account.employeeId}?organizationId=${ORG_ID}`);
      if (!res.ok) throw new Error('employee fetch failed');
      const employee = await res.json();
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
      document.getElementById('infoName').textContent = fullName || '—';
    } catch (err) {
      document.getElementById('infoName').textContent = '—';
    }
  })();

  // --- Organization snapshot (reuses already-working, org-scoped endpoints) --
  async function loadSnapshot() {
    try {
      const [products, employees, suppliers] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products/all?organizationId=${ORG_ID}`).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE_URL}/api/Employees/all?organizationId=${ORG_ID}`).then((r) => r.ok ? r.json() : []),
        fetch(`${API_BASE_URL}/api/Suppliers/all?organizationId=${ORG_ID}`).then((r) => r.ok ? r.json() : [])
      ]);
      document.getElementById('statProducts').textContent = products.length;
      document.getElementById('statEmployees').textContent = employees.length;
      document.getElementById('statSuppliers').textContent = suppliers.length;
    } catch (err) {
      showPageBanner('Could not load organization snapshot. Is the backend running?', 'error');
    }
  }
  loadSnapshot();

  // --- Change password ------------------------------------------------------
  const passwordForm = document.getElementById('passwordForm');
  const passwordBanner = document.getElementById('passwordBanner');
  const passwordSubmit = document.getElementById('passwordSubmit');

  function showPasswordBanner(text, type) {
    passwordBanner.textContent = text;
    passwordBanner.className = 'form-banner ' + type;
    passwordBanner.hidden = false;
  }
  function hidePasswordBanner() { passwordBanner.hidden = true; }

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
    if (err) err.textContent = msg;
  }

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hidePasswordBanner();
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(clearFieldError);

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;

    // NOTE: this checks against the password cached in this browser session,
    // since there's no dedicated "verify current password" endpoint yet.
    // It's a UX safeguard, not real server-side verification — the backend
    // still stores/returns passwords in plain text at this stage (flagged
    // separately as a known security gap to fix before production).
    if (currentPassword !== account.password) {
      setFieldError('currentPassword', 'Current password is incorrect');
      valid = false;
    }
    if (!newPassword || newPassword.length < 4) {
      setFieldError('newPassword', 'Password must be at least 4 characters');
      valid = false;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
      valid = false;
    }

    if (!valid) {
      showPasswordBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    passwordSubmit.disabled = true;
    passwordSubmit.textContent = 'Updating...';

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/${account.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPassword)
      });

      if (!res.ok) throw new Error('Update failed');

      // Keep the cached session copy in sync so future checks on this page work.
      account.password = newPassword;
      sessionStorage.setItem('inventraAccount', JSON.stringify(account));

      showPasswordBanner('Password updated.', 'success');
      passwordForm.reset();
    } catch (err) {
      showPasswordBanner('Could not update password. Please try again.', 'error');
    } finally {
      passwordSubmit.disabled = false;
      passwordSubmit.textContent = 'Update password';
    }
  });
});