document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const banner = document.getElementById('formBanner');

  const fields = ['username', 'password', 'employeeId', 'organizationId', 'role'];

  const messages = {
    username: 'Username is required',
    password: 'Password is required',
    employeeId: 'Enter a valid employee ID',
    organizationId: 'Enter a valid organization ID',
    role: 'Role is required'
  };

  function showBanner(text, type) {
    banner.textContent = text;
    banner.className = 'form-banner ' + type;
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    banner.textContent = '';
  }

  function clearFieldError(name) {
    const input = document.getElementById(name);
    const err = document.getElementById('err-' + name);
    input.classList.remove('invalid');
    err.textContent = '';
  }

  function setFieldError(name, msg) {
    const input = document.getElementById(name);
    const err = document.getElementById('err-' + name);
    input.classList.add('invalid');
    err.textContent = msg || messages[name] || 'Invalid value';
  }

  function validate(data) {
    let valid = true;
    fields.forEach(clearFieldError);

    ['username', 'password', 'role'].forEach((name) => {
      if (!data[name] || !data[name].trim()) {
        setFieldError(name);
        valid = false;
      }
    });

    ['employeeId', 'organizationId'].forEach((name) => {
      const value = data[name];
      if (!value || !/^\d+$/.test(String(value).trim())) {
        setFieldError(name);
        valid = false;
      }
    });

    return valid;
  }

  function extractErrorMessage(body) {
    if (!body) return null;
    if (typeof body === 'string') return body;
    if (body.message) return body.message;
    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors
        .map((e) => e.defaultMessage || e.message || `${e.field}: invalid`)
        .join(' ');
    }
    return null;
  }

  function applyFieldErrors(body) {
    if (!body || !Array.isArray(body.errors)) return false;
    let applied = false;
    body.errors.forEach((e) => {
      const field = e.field;
      if (field && fields.includes(field)) {
        setFieldError(field, e.defaultMessage || e.message);
        applied = true;
      }
    });
    return applied;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner();

    const formData = new FormData(form);
    const raw = Object.fromEntries(formData.entries());

    if (!validate(raw)) {
      showBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const payload = {
      username: raw.username,
      password: raw.password,
      employeeId: Number(raw.employeeId),
      organizationId: Number(raw.organizationId),
      role: raw.role
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try {
        body = await response.json();
      } catch (_) {
        // No JSON body — handled below.
      }

      if (response.ok) {
        // No token is issued by this endpoint yet, so we hold the account
        // details client-side for the dashboard to read.
        sessionStorage.setItem('inventraAccount', JSON.stringify(body));
        showBanner('Logged in. Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        return;
      }

      const fieldErrorsApplied = applyFieldErrors(body);
      const message = extractErrorMessage(body);

      if (message) {
        showBanner(message, 'error');
      } else if (fieldErrorsApplied) {
        showBanner('Please fix the highlighted fields.', 'error');
      } else if (response.status === 401 || response.status === 403) {
        showBanner('Invalid username, password, or role for that account.', 'error');
      } else if (response.status === 404) {
        showBanner('No matching account found.', 'error');
      } else {
        showBanner('Login failed. Please check your details and try again.', 'error');
      }
    } catch (err) {
      showBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
});