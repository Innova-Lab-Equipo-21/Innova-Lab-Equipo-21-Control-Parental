/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Módulo: Recuperación de Contraseña (Firebase Auth Action Handler)
 * Archivo: landing/scripts/reset-password.js
 * Descripción: Maneja la validación de oobCode, cambio de contraseña vía Firebase
 *              REST API y actualización reactiva de emociones de Boti.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Configuración predeterminada de Firebase para BA Protege+
  const DEFAULT_API_KEY = 'AIzaSyCX_IZ_wVEkxjp6g1yV6SgDpVErkg8lH3g';
  const FIREBASE_RESET_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword';

  // Elementos del DOM
  const botiImg = document.getElementById('boti-avatar');
  const loadingView = document.getElementById('view-loading');
  const formView = document.getElementById('view-form');
  const successView = document.getElementById('view-success');
  const errorView = document.getElementById('view-error');
  const userEmailChip = document.getElementById('user-email-chip');
  const resetForm = document.getElementById('reset-password-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitText = document.getElementById('submit-text');
  const formErrorAlert = document.getElementById('form-error-alert');
  const formErrorText = document.getElementById('form-error-text');
  const errorTitle = document.getElementById('error-title');
  const errorDesc = document.getElementById('error-desc');

  // Medidor de seguridad
  const strengthBar = document.getElementById('strength-bar-fill');
  const strengthLabel = document.getElementById('strength-label-text');
  const ruleLength = document.getElementById('rule-length');
  const ruleMix = document.getElementById('rule-mix');

  // Rutas de las imágenes de Boti según emoción
  const BOTI_IMAGES = {
    pensando: 'assets/img/botito_pensando.png',
    feliz: 'assets/img/botito_feliz.png',
    triste: 'assets/img/botito_triste.png',
    nervioso: 'assets/img/botito_nervioso.png',
  };

  /**
   * Cambia la emoción y alt de Boti
   */
  function setBotiMood(mood, altText) {
    if (botiImg && BOTI_IMAGES[mood]) {
      botiImg.src = BOTI_IMAGES[mood];
      botiImg.alt = altText || `Boti ${mood}`;
    }
  }

  /**
   * Cambia la vista visible (loading, form, success, error)
   */
  function showView(viewId) {
    [loadingView, formView, successView, errorView].forEach((v) => {
      if (v) v.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }
  }

  /**
   * Muestra mensaje de error en el formulario
   */
  function showFormError(msg) {
    if (formErrorAlert && formErrorText) {
      formErrorText.textContent = msg;
      formErrorAlert.style.display = 'flex';
    }
  }

  function hideFormError() {
    if (formErrorAlert) {
      formErrorAlert.style.display = 'none';
    }
  }

  /**
   * Extrae los parámetros de la URL
   */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      mode: params.get('mode') || 'resetPassword',
      oobCode: params.get('oobCode'),
      apiKey: params.get('apiKey') || DEFAULT_API_KEY,
      continueUrl: params.get('continueUrl'),
      lang: params.get('lang') || 'es',
    };
  }

  /**
   * Valida la fuerza de la contraseña y actualiza la UI
   */
  function evaluatePasswordStrength(password) {
    const hasLength = password.length >= 6;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (ruleLength) {
      ruleLength.className = hasLength ? 'valid' : 'invalid';
    }
    if (ruleMix) {
      ruleMix.className = (hasLetters && hasNumbers) ? 'valid' : 'invalid';
    }

    if (!password) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = '#DEE2E6';
      strengthLabel.textContent = 'Mínimo 6 caracteres';
      return 0;
    }

    let score = 0;
    if (hasLength) score += 1;
    if (password.length >= 8) score += 1;
    if (hasLetters && hasNumbers) score += 1;
    if (hasSpecial) score += 1;

    if (score <= 1) {
      strengthBar.style.width = '25%';
      strengthBar.style.backgroundColor = '#DC3545';
      strengthLabel.textContent = 'Débil';
      strengthLabel.style.color = '#DC3545';
    } else if (score === 2) {
      strengthBar.style.width = '60%';
      strengthBar.style.backgroundColor = '#FFC107';
      strengthLabel.textContent = 'Aceptable';
      strengthLabel.style.color = '#856404';
    } else {
      strengthBar.style.width = '100%';
      strengthBar.style.backgroundColor = '#28A745';
      strengthLabel.textContent = 'Fuerte';
      strengthLabel.style.color = '#28A745';
    }

    return score;
  }

  /**
   * Paso 1: Valida el código oobCode al iniciar la página
   */
  async function verifyResetCode(apiKey, oobCode) {
    try {
      setBotiMood('pensando', 'Boti verificando enlace');
      showView('view-loading');

      const response = await fetch(`${FIREBASE_RESET_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleVerificationError(data?.error?.message || 'ERROR_UNKNOWN');
        return;
      }

      // Código válido: mostramos formulario y correo
      const email = data.email || 'tu cuenta de responsable';
      if (userEmailChip) {
        userEmailChip.innerHTML = `de <strong>${escapeHtml(email)}</strong>`;
      }

      setBotiMood('feliz', 'Boti listo para ayudarte');
      showView('view-form');
      if (newPasswordInput) newPasswordInput.focus();
    } catch (err) {
      handleVerificationError('NETWORK_ERROR');
    }
  }

  /**
   * Manejo de errores de validación de código
   */
  function handleVerificationError(errorCode) {
    showView('view-error');
    setBotiMood('triste', 'Boti triste');

    if (errorCode.includes('EXPIRED_OOB_CODE')) {
      errorTitle.textContent = 'El enlace ha caducado';
      errorDesc.textContent =
        'Por motivos de seguridad, los enlaces de recuperación expiran luego de un tiempo. Ingresá a la app BA Protege+ y solicitá uno nuevo.';
    } else if (errorCode.includes('INVALID_OOB_CODE')) {
      errorTitle.textContent = 'Enlace inválido o ya utilizado';
      errorDesc.textContent =
        'Este enlace ya no es válido. Es posible que ya hayas cambiado la contraseña o que el enlace esté incompleto.';
    } else if (errorCode.includes('USER_DISABLED')) {
      errorTitle.textContent = 'Cuenta inhabilitada';
      errorDesc.textContent =
        'La cuenta de usuario asociada ha sido inhabilitada. Por favor comunicate con el soporte oficial.';
    } else {
      errorTitle.textContent = 'No se pudo validar el enlace';
      errorDesc.textContent =
        'Ocurrió un error al verificar tu solicitud. Por favor verifica tu conexión a Internet o solicita un nuevo enlace.';
    }
  }

  /**
   * Paso 2: Confirma el restablecimiento con la nueva contraseña
   */
  async function confirmPasswordReset(apiKey, oobCode, newPassword) {
    hideFormError();
    submitBtn.disabled = true;
    submitSpinner.style.display = 'inline-block';
    submitText.textContent = 'Guardando...';
    setBotiMood('pensando', 'Boti guardando contraseña');

    try {
      const response = await fetch(`${FIREBASE_RESET_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oobCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || '';
        if (errorMsg.includes('WEAK_PASSWORD')) {
          showFormError('La contraseña es demasiado débil. Ingresá al menos 6 caracteres seguros.');
        } else if (errorMsg.includes('EXPIRED_OOB_CODE')) {
          handleVerificationError('EXPIRED_OOB_CODE');
        } else {
          showFormError('No se pudo guardar la contraseña. Reintentá en unos momentos.');
        }
        submitBtn.disabled = false;
        submitSpinner.style.display = 'none';
        submitText.textContent = 'GUARDAR CONTRASEÑA';
        setBotiMood('nervioso', 'Boti con dudas');
        return;
      }

      // Éxito total
      setBotiMood('feliz', 'Boti feliz festejando');
      showView('view-success');
    } catch (err) {
      showFormError('Error de red. Verifica tu conexión a Internet e inténtalo nuevamente.');
      submitBtn.disabled = false;
      submitSpinner.style.display = 'none';
      submitText.textContent = 'GUARDAR CONTRASEÑA';
      setBotiMood('nervioso', 'Boti nervioso');
    }
  }

  /**
   * Escapar HTML para evitar XSS
   */
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));
  }

  /**
   * Configura alternar visibilidad de contraseña
   */
  function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        this.textContent = isPassword ? '👁️' : '🔒';
        this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Ver contraseña');
      });
    });
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggles();

    const { oobCode, apiKey } = getUrlParams();

    // Verificamos si hay código oobCode
    if (!oobCode) {
      showView('view-error');
      setBotiMood('nervioso', 'Boti esperando enlace');
      if (errorTitle) errorTitle.textContent = 'Falta el código de seguridad';
      if (errorDesc) {
        errorDesc.textContent =
          'Esta página fue abierta sin el código de recuperación proporcionado en el correo. Por favor abrí el enlace que recibiste en tu email.';
      }
      return;
    }

    // Evaluador en tiempo real
    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', (e) => {
        evaluatePasswordStrength(e.target.value);
      });
    }

    // Submit del formulario
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = newPasswordInput.value;
        const confirm = confirmPasswordInput.value;

        if (pwd.length < 6) {
          showFormError('La contraseña debe tener un mínimo de 6 caracteres.');
          newPasswordInput.focus();
          return;
        }

        if (pwd !== confirm) {
          showFormError('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
          confirmPasswordInput.focus();
          return;
        }

        confirmPasswordReset(apiKey, oobCode, pwd);
      });
    }

    // Ejecuta la verificación inicial
    verifyResetCode(apiKey, oobCode);
  });
})();
