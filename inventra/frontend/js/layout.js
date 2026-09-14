const SIDEBAR_LINKS = [
  { key: 'Dashboard', label: 'Dashboard', href: 'dashboard.html' },
  { key: 'Inventory', label: 'Inventory', href: 'inventory.html' },
  { key: 'Employees', label: 'Employees', href: 'employees.html' },
  { key: 'Suppliers', label: 'Suppliers', href: 'suppliers.html' },
  { key: 'Sales', label: 'Sales', href: 'sales.html' },
  { key: 'Purchases', label: 'Purchases', href: 'coming-soon.html?module=Purchases' },
  { key: 'Reports', label: 'Reports', href: 'reports.html' },
  { key: 'Settings', label: 'Settings', href: 'settings.html' }
];

const Inventra = {
  account: null,

  // Redirects to login.html if no logged-in account is found.
  // TODO: replace with a real token/session check once the backend issues one.
  requireAuth() {
    const raw = sessionStorage.getItem('inventraAccount');
    if (!raw) {
      window.location.href = 'login.html';
      return null;
    }
    try {
      this.account = JSON.parse(raw);
    } catch (_) {
      this.account = {};
    }
    return this.account;
  },

  // Injects the sidebar and topbar into placeholder elements, and wires logout.
  // Call this first thing on every page inside the dashboard shell.
  initShell(activeKey, pageTitle) {
    const account = this.requireAuth();
    if (!account) return null;

    const sidebarEl = document.getElementById('sidebarPlaceholder');
    const topbarEl = document.getElementById('topbarPlaceholder');

    if (sidebarEl) sidebarEl.outerHTML = this._sidebarHtml(activeKey);
    if (topbarEl) topbarEl.outerHTML = this._topbarHtml(pageTitle, account);

    this._loadRealName(account);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('inventraAccount');
        window.location.href = 'login.html';
      });
    }

    return account;
  },

  _sidebarHtml(activeKey) {
    const links = SIDEBAR_LINKS.map((l) => `
      <a href="${l.href}" class="sidebar-link${l.key === activeKey ? ' active' : ''}">
        <span class="sidebar-dot"></span>${l.label}
      </a>
    `).join('');

    return `
      <aside class="sidebar">
        <a class="brand brand-sidebar" href="dashboard.html">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" width="24" height="24">
              <rect x="3" y="10" width="10" height="15" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <rect x="15" y="4" width="10" height="21" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <line x1="3" y1="15" x2="13" y2="15" stroke="currentColor" stroke-width="1.6"/>
              <line x1="15" y1="10" x2="25" y2="10" stroke="currentColor" stroke-width="1.6"/>
            </svg>
          </span>
          Inventra
        </a>
        <nav class="sidebar-nav">${links}</nav>
        <button class="sidebar-logout" id="logoutBtn">Logout</button>
      </aside>
    `;
  },

  _topbarHtml(pageTitle, account) {
    const displayName = account.firstName
      ? `${account.firstName} ${account.lastName || ''}`.trim()
      : (account.username || '—');

    return `
      <header class="topbar">
        <h1 class="topbar-title">${pageTitle}</h1>
        <div class="topbar-right">
          <button class="topbar-icon-btn" id="notifBtn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/>
            </svg>
            <span class="topbar-badge" id="notifBadge" hidden></span>
          </button>
          <div class="topbar-user">
            <span class="topbar-user-name" id="topbarUserName">${displayName}</span>
            <span class="topbar-user-role">${account.role || '—'}</span>
          </div>
        </div>
      </header>
    `;
  },

  // Account has no name field — the real name lives on the Employee record.
  // Called after the topbar is in the DOM, upgrades the fallback username display.
  _loadRealName(account) {
    if (!account.employeeId || !account.organizationId) return;
    fetch(`${API_BASE_URL}/api/Employees/${account.employeeId}?organizationId=${account.organizationId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((employee) => {
        if (!employee || !employee.firstName) return;
        const el = document.getElementById('topbarUserName');
        if (el) el.textContent = `${employee.firstName} ${employee.lastName || ''}`.trim();
      })
      .catch(() => { /* keep the username fallback */ });
  }
};