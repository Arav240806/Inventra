document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const formBanner = document.getElementById('formBanner');
  const authSub = document.getElementById('authSub');
  const roleSelect = document.getElementById('role');
  const ownerFields = document.getElementById('ownerFields');
  const joinFields = document.getElementById('joinFields');
  const submitBtn = document.getElementById('submitBtn');

  const OWNER_ONLY_FIELDS = ['organizationName', 'organizationType', 'contactNumber'];
  const JOIN_ONLY_FIELDS = ['organizationId'];
  const COMMON_FIELDS = ['firstName', 'lastName', 'email', 'username', 'password'];

  function showBanner(text, type) {
    formBanner.textContent = text;
    formBanner.className = 'form-banner ' + type;
    formBanner.hidden = false;
  }
  function hideBanner() { formBanner.hidden = true; }

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

  // --- Role switching: show the right field group, toggle 'required' so
  // hidden fields never block submission with an invisible validation error --
  function applyRole(role) {
    [...OWNER_ONLY_FIELDS, ...JOIN_ONLY_FIELDS].forEach(clearFieldError);

    if (role === 'Owner') {
      ownerFields.hidden = false;
      joinFields.hidden = true;
      OWNER_ONLY_FIELDS.forEach((n) => document.getElementById(n).setAttribute('required', ''));
      JOIN_ONLY_FIELDS.forEach((n) => document.getElementById(n).removeAttribute('required'));
      authSub.textContent = 'Set up your organization on Inventra.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create organization';
    } else if (role === 'Manager' || role === 'Employee') {
      ownerFields.hidden = true;
      joinFields.hidden = false;
      JOIN_ONLY_FIELDS.forEach((n) => document.getElementById(n).setAttribute('required', ''));
      OWNER_ONLY_FIELDS.forEach((n) => document.getElementById(n).removeAttribute('required'));
      authSub.textContent = `Join your organization on Inventra as a ${role}.`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Join organization';
    } else {
      ownerFields.hidden = true;
      joinFields.hidden = true;
      [...OWNER_ONLY_FIELDS, ...JOIN_ONLY_FIELDS].forEach((n) => document.getElementById(n).removeAttribute('required'));
      authSub.textContent = 'Set up your organization on Inventra.';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Select a role to continue';
    }
  }

  roleSelect.addEventListener('change', () => applyRole(roleSelect.value));

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

  function validate(role, data) {
    let valid = true;
    [...COMMON_FIELDS, ...OWNER_ONLY_FIELDS, ...JOIN_ONLY_FIELDS].forEach(clearFieldError);

    if (!role) {
      setFieldError('role', 'Please select a role');
      valid = false;
    }

    COMMON_FIELDS.forEach((name) => {
      if (!data[name] || !data[name].trim()) {
        setFieldError(name, 'This field is required');
        valid = false;
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setFieldError('email', 'Enter a valid email address');
      valid = false;
    }

    if (role === 'Owner') {
      if (!data.organizationName || !data.organizationName.trim()) {
        setFieldError('organizationName', 'This field is required');
        valid = false;
      }
      if (!data.organizationType) {
        setFieldError('organizationType', 'This field is required');
        valid = false;
      }
      if (!data.contactNumber || !/^\d{10}$/.test(data.contactNumber.trim())) {
        setFieldError('contactNumber', 'Must be exactly 10 digits');
        valid = false;
      }
    } else if (role === 'Manager' || role === 'Employee') {
      if (!data.organizationId || !/^\d+$/.test(String(data.organizationId).trim())) {
        setFieldError('organizationId', 'Enter a valid Organization ID');
        valid = false;
      }
    }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner();

    const role = roleSelect.value;
    const formData = new FormData(form);
    const raw = Object.fromEntries(formData.entries());

    if (!validate(role, raw)) {
      showBanner('Please fix the highlighted fields.', 'error');
      return;
    }

    const isOwner = role === 'Owner';

    const url = isOwner
      ? `${API_BASE_URL}/api/accounts/register`
      : `${API_BASE_URL}/api/accounts/join`;

    const payload = isOwner
      ? {
          firstName: raw.firstName,
          lastName: raw.lastName,
          organizationName: raw.organizationName,
          organizationType: raw.organizationType,
          email: raw.email,
          contactNumber: raw.contactNumber,
          role: 'Owner',
          username: raw.username,
          password: raw.password
        }
      : {
          organizationId: Number(raw.organizationId),
          firstName: raw.firstName,
          lastName: raw.lastName,
          email: raw.email,
          role: role,
          username: raw.username,
          password: raw.password
        };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let body = null;
      try { body = await response.json(); } catch (_) { /* no body */ }

      if (response.ok) {
        form.hidden = true;
        document.getElementById('revealOrgId').textContent = body.organizationId ?? '—';
        document.getElementById('revealEmployeeId').textContent = body.employeeId ?? '—';
        document.getElementById('revealUsername').textContent = body.userName ?? raw.username ?? '—';
        document.getElementById('successPanel').hidden = false;
        return;
      }

      const message = extractErrorMessage(body);
      showBanner(
        message || (isOwner
          ? 'Could not create your organization. Please check your details.'
          : 'Could not join that organization. Double-check the Organization ID.'),
        'error'
      );
    } catch (err) {
      showBanner('Could not reach the server. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isOwner ? 'Create organization' : 'Join organization';
    }
  });
});