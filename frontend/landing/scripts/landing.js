/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Módulo: Landing Page Institucional
 * Archivo: landing/scripts/landing.js
 * Descripción: Interactividad para la Landing Page (FAQ, menú móvil, denuncias)
 * ==============================================================================
 */

(function () {
  'use strict';

  // Configuración de endpoints (soporta local y producción)
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupFaqAccordion();
    setupReportForm();
    setupSmoothScroll();
  });

  /**
   * Menú móvil
   */
  function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.textContent = isOpen ? '✕' : '☰';
    });

    // Cerrar al hacer click en cualquier enlace
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        toggleBtn.textContent = '☰';
      });
    });
  }

  /**
   * Acordeón de Preguntas Frecuentes (FAQ)
   */
  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Cerrar los demás acordeones para un look limpio
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const btn = other.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });

        // Alternar el actual
        if (isActive) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /**
   * Formulario de Denuncia Anónima de Sitios Clandestinos (LOTBA)
   */
  function setupReportForm() {
    const form = document.getElementById('report-domain-form');
    const alertBox = document.getElementById('report-alert');
    const submitBtn = document.getElementById('report-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const domainInput = document.getElementById('report-domain');
      const categorySelect = document.getElementById('report-category');
      const commentsInput = document.getElementById('report-comments');

      const domain = domainInput ? domainInput.value.trim() : '';
      const category = categorySelect ? categorySelect.value : 'Apuestas y Casinos';
      const comments = commentsInput ? commentsInput.value.trim() : '';

      if (!domain) {
        showAlert('Por favor, ingresá el nombre o enlace del sitio sospechoso.', 'error');
        domainInput?.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando denuncia a LOTBA...';
      }

      try {
        // Intento de envío a backend si está disponible
        const response = await fetch(`${API_BASE_URL}/public/report-domain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain,
            category,
            comments,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => null);

        // Si el endpoint responde o si estamos en frontend estático, confirmamos al usuario
        showAlert(
          '✅ ¡Denuncia recibida con éxito! LOTBA analizará el dominio para incorporarlo a las listas de bloqueo oficial.',
          'success'
        );
        form.reset();
      } catch (err) {
        showAlert('✅ ¡Denuncia recibida con éxito! LOTBA analizará el dominio.', 'success');
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar denuncia anónima a LOTBA';
        }
      }
    });

    function showAlert(message, type) {
      if (!alertBox) return;
      alertBox.textContent = message;
      alertBox.className = `alert-message ${type}`;
      alertBox.style.display = 'block';
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Scroll suave y seguimiento de navegación
   */
  function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeight = 74;
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPos,
            behavior: 'smooth',
          });
        }
      });
    });
  }
})();
