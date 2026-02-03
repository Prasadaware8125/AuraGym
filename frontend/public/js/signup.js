'use strict';

/**
 * AURA GYM SIGNUP SYSTEM
 * Frontend Responsibilities ONLY:
 * - UI role switching
 * - Field toggling
 * - Client-side validation
 * - Let backend handle redirect
 */

document.addEventListener('DOMContentLoaded', () => {

  // State
  let role = 'member';

  // DOM Elements
  const body = document.body;
  const roleBtns = document.querySelectorAll('.role-btn');
  const form = document.getElementById('signup-form');
  const errorMsg = document.getElementById('error-msg');
  const successMsg = document.getElementById('success-msg');

  const memberFields = document.getElementById('member-fields');
  const adminFields = document.getElementById('admin-fields');

  const fullname = document.getElementById('fullname');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const adminCode = document.getElementById('admin-code');
  const terms = document.getElementById('terms');

  // 🔑 Hidden role input (sent to backend)
  const roleInput = document.getElementById('role');

  /* ======================================
     1. ROLE SWITCHING
  ====================================== */
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      role = btn.dataset.role;
      roleInput.value = role;

      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (role === 'admin') {
        body.setAttribute('data-theme', 'admin');
        document.documentElement.style.setProperty('--accent', '#00f2ff');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(0,242,255,0.4)');
        memberFields.classList.add('hidden');
        adminFields.classList.remove('hidden');
      } else {
        body.removeAttribute('data-theme');
        document.documentElement.style.setProperty('--accent', '#39ff14');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(57,255,20,0.4)');
        memberFields.classList.remove('hidden');
        adminFields.classList.add('hidden');
      }

      hideMessages();
    });
  });

  /* ======================================
     2. FORM SUBMISSION (VALIDATION)
  ====================================== */
  form.addEventListener('submit', (e) => {
    hideMessages();

    // ❌ Stop submit ONLY if validation fails
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    // ✅ Validation passed
    // Let form submit normally to backend
    successMsg.classList.remove('hidden');
  });

  /* ======================================
     3. VALIDATION FUNCTIONS
  ====================================== */
  function validateForm() {
    if (fullname.value.trim().length < 2) {
      showError('Please enter your full name.');
      return false;
    }

    if (!validateEmail(email.value.trim())) {
      showError('Please enter a valid email address.');
      return false;
    }

    if (password.value.length < 6) {
      showError('Password must be at least 6 characters.');
      return false;
    }

    if (password.value !== confirmPassword.value) {
      showError('Passwords do not match.');
      return false;
    }

    if (role === 'member') {
      const age = document.getElementById('age').value;
      const goal = document.getElementById('goal').value;

      if (!age || age < 16) {
        showError('You must be at least 16 years old.');
        return false;
      }
      if (!goal) {
        showError('Please select a fitness goal.');
        return false;
      }
    }

    // if (role === 'admin') {
    //   if (adminCode.value.trim() !== 'AURA2024') {
    //     showError('Invalid Admin Access Code.');
    //     return false;
    //   }
    // }

    if (!terms.checked) {
      showError('You must agree to the Terms & Conditions.');
      return false;
    }

    return true;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(msg) {
    errorMsg.querySelector('span').textContent = msg;
    errorMsg.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideMessages() {
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
  }

});
