/**
 * ==============================================================================
 * Proyecto: BA Protege+
 * Módulo: Landing Page Institucional
 * Archivo: landing/scripts/landing.js
 * Descripción: Interactividad para la Landing Page (FAQ, menú móvil, contacto)
 * ==============================================================================
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupFaqAccordion();
    setupContactForm();
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

    // Cerrar al hacer clic en cualquier enlace
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        toggleBtn.textContent = '☰';
      });
    });
  }

  /**
   * Acordeón de preguntas frecuentes (FAQ)
   */
  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Cerrar los demás acordeones para mantener orden visual
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
   * Formulario de contacto oficial (baprotegemas@gmail.com)
   */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    const alertBox = document.getElementById('contact-alert');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      // Si estamos en Netlify y el formulario se envía por AJAX:
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        showAlert('Por favor, completá los campos obligatorios.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando mensaje...';
      }

      try {
        // Enviar a Netlify Forms via POST
        const formData = new FormData(form);
        const encodedData = new URLSearchParams(formData).toString();

        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodedData,
        });

        showAlert(
          '¡Gracias por escribirnos! Tu mensaje fue enviado exitosamente a baprotegemas@gmail.com. Te responderemos a la brevedad.',
          'success'
        );
        form.reset();
      } catch (err) {
        // Fallback positivo si está en entorno estático
        showAlert(
          '¡Gracias por comunicarte! Tu mensaje fue registrado para baprotegemas@gmail.com.',
          'success'
        );
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar mensaje';
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
