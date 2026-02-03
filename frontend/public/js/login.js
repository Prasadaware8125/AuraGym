'use strict';

/**
 * AURA GYM LOGIN UI CONTROLLER
 * Responsibilities:
 * - Role switching (Member/Admin)
 * - Theme switching
 * - Update hidden role input for backend
 * - Password visibility toggle
 */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;

  // Role buttons
  const roleButtons = document.querySelectorAll('.role-btn');
  const roleInput = document.getElementById('role');

  // Password toggle
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');

  /* ===============================
     ROLE SWITCHING
  =============================== */
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedRole = btn.dataset.role;

      // Update active UI
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update hidden input (IMPORTANT)
      roleInput.value = selectedRole;

      // Theme switch
      if (selectedRole === 'admin') {
        body.setAttribute('data-theme', 'admin');
        document.documentElement.style.setProperty('--accent', '#00f2ff');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(0, 242, 255, 0.4)');
      } else {
        body.removeAttribute('data-theme');
        document.documentElement.style.setProperty('--accent', '#39ff14');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(57, 255, 20, 0.4)');
      }
    });
  });

  /* ===============================
     PASSWORD VISIBILITY TOGGLE
  =============================== */
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const icon = togglePasswordBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });

});
