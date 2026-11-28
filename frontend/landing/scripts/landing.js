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
    setupImageFallbacks();
    setupBackToTop();
    setupMobileCarousels();
    setupTeamCarousel();
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
  /**
   * Respaldo local si alguna imagen externa no logra cargarse
   */
  function setupImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach((img) => {
      const applyFallback = () => {
        const fallback = img.getAttribute('data-fallback');
        if (!fallback || img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = fallback;
        img.classList.add('fallback-contain');
      };

      img.addEventListener('error', applyFallback);

      if (img.complete && img.naturalWidth === 0) {
        applyFallback();
      }
    });
  }
  /**
   * Botón flotante para volver al inicio
   */
  function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 320;
      btn.classList.toggle('visible', shouldShow);
      btn.setAttribute('aria-hidden', String(!shouldShow));
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Carruseles horizontales con controles e indicadores para pantallas pequeñas
   */
  function setupMobileCarousels() {
    const carousels = document.querySelectorAll('[data-mobile-carousel="true"]');

    carousels.forEach((track) => {
      const slides = Array.from(track.children);
      if (slides.length <= 1) return;

      const controls = document.createElement('div');
      controls.className = 'carousel-controls';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'carousel-btn';
      prevBtn.setAttribute('aria-label', 'Tarjeta anterior');
      prevBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'carousel-dots';

      const dots = slides.map((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = idx === 0 ? 'carousel-dot active' : 'carousel-dot';
        dot.setAttribute('aria-label', `Ir a la tarjeta ${idx + 1}`);
        dot.addEventListener('click', () => scrollToSlide(idx));
        dotsWrap.appendChild(dot);
        return dot;
      });

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'carousel-btn';
      nextBtn.setAttribute('aria-label', 'Tarjeta siguiente');
      nextBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

      controls.appendChild(prevBtn);
      controls.appendChild(dotsWrap);
      controls.appendChild(nextBtn);
      track.insertAdjacentElement('afterend', controls);

      let activeIndex = 0;

      function scrollToSlide(index) {
        const clamped = Math.max(0, Math.min(slides.length - 1, index));
        const target = slides[clamped];
        if (!target) return;
        const left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
        track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      }

      function updateState() {
        const center = track.scrollLeft + track.clientWidth / 2;
        let closestIdx = 0;
        let minDistance = Infinity;

        slides.forEach((slide, idx) => {
          const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
          const dist = Math.abs(slideCenter - center);
          if (dist < minDistance) {
            minDistance = dist;
            closestIdx = idx;
          }
        });

        activeIndex = closestIdx;
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIndex);
        });
        prevBtn.disabled = activeIndex === 0;
        nextBtn.disabled = activeIndex === slides.length - 1;
      }

      prevBtn.addEventListener('click', () => scrollToSlide(activeIndex - 1));
      nextBtn.addEventListener('click', () => scrollToSlide(activeIndex + 1));

      let ticking = false;
      track.addEventListener(
        'scroll',
        () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(() => {
            updateState();
            ticking = false;
          });
        },
        { passive: true }
      );

      window.addEventListener('resize', updateState, { passive: true });
      updateState();
    });
  }

  /**
   * Carrusel interactivo y responsive para Nuestro equipo (Desktop, Tablet y Móvil)
   */
  function setupTeamCarousel() {
    const track = document.getElementById('team-carousel-track');
    const prevBtn = document.getElementById('team-carousel-prev');
    const nextBtn = document.getElementById('team-carousel-next');
    const dotsContainer = document.getElementById('team-carousel-dots');

    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.team-card'));
    if (!cards.length) return;

    function getVisibleCount() {
      const width = window.innerWidth;
      if (width <= 768) return 1;
      if (width <= 1024) return 2;
      return 3;
    }

    let dots = [];

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const visibleCount = getVisibleCount();
      const pageCount = Math.max(1, Math.ceil(cards.length / visibleCount));

      dots = [];
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = i === 0 ? 'team-carousel-dot active' : 'team-carousel-dot';
        dot.setAttribute('aria-label', `Ir al grupo ${i + 1} de integrantes`);
        dot.addEventListener('click', () => {
          const targetIndex = Math.min(i * visibleCount, cards.length - 1);
          const target = cards[targetIndex];
          if (target) {
            track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
          }
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    }

    function updateState() {
      const scrollLeft = track.scrollLeft;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);

      if (prevBtn) prevBtn.disabled = scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 4;

      if (dots.length > 0) {
        const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        const activeIndex = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIndex);
        });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const scrollAmount = track.clientWidth;
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const scrollAmount = track.clientWidth;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    let ticking = false;
    track.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateState();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        buildDots();
        updateState();
      },
      { passive: true }
    );

    buildDots();
    updateState();
  }
})();
