/* ============================================
   BILL'S WISDOM — Main JavaScript
   Handles: scroll animations, header, mobile menu,
   FAQ accordion, form validation & submission
   ============================================ */

(function () {
  'use strict';

  /* ---- Scroll-based animations ---- */
  function initScrollAnimations() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var elements = document.querySelectorAll('[data-animate]');

    if (prefersReduced) {
      // Show everything immediately
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    // Immediately reveal elements already in viewport (above the fold)
    elements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Small delay so the animation is visible rather than instant
        setTimeout(function () { el.classList.add('visible'); }, 100);
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    elements.forEach(function (el) {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });
  }


  /* ---- Sticky header scroll state ---- */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var scrollThreshold = 20;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on load
  }


  /* ---- Mobile menu ---- */
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-hidden', String(isOpen));
      menu.classList.toggle('open', !isOpen);
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('open');
      });
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('open');
        toggle.focus();
      }
    });
  }


  /* ---- Smooth scroll for anchor links ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL without scroll jump
        if (history.pushState) {
          history.pushState(null, '', targetId);
        }
      });
    });
  }


  /* ---- Form validation & submission ---- */
  function initForms() {
    setupForm('contact-form', 'contact-success', 'contact-website');
    setupForm('investor-form', 'investor-success', 'investor-website');
  }

  function setupForm(formId, successId, honeypotId) {
    var form = document.getElementById(formId);
    var success = document.getElementById(successId);
    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      var hp = document.getElementById(honeypotId);
      if (hp && hp.value) return; // Bot detected

      // Clear previous errors
      form.querySelectorAll('.error').forEach(function (el) {
        el.classList.remove('error');
      });
      form.querySelectorAll('.form-error-msg').forEach(function (el) {
        el.remove();
      });

      // Validate
      var isValid = true;
      var requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Focus first error
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission (replace with actual API call)
      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      setTimeout(function () {
        form.style.display = 'none';
        success.hidden = false;
        success.setAttribute('role', 'alert');
      }, 800);
    });

    // Real-time validation on blur
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.hasAttribute('required') && field.value.trim()) {
          validateField(field);
        }
      });
    });
  }

  function validateField(field) {
    var value = field.value.trim();
    var isValid = true;
    var message = '';

    // Check empty required
    if (field.hasAttribute('required')) {
      if (field.type === 'checkbox' && !field.checked) {
        isValid = false;
        message = 'This confirmation is required';
      } else if (field.type === 'select-one' && (!value || field.selectedIndex === 0)) {
        isValid = false;
        message = 'Please select an option';
      } else if (!value) {
        isValid = false;
        message = 'This field is required';
      }
    }

    // Check email format
    if (isValid && field.type === 'email' && value) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    }

    if (!isValid) {
      field.classList.add('error');
      // Add error message
      var errorEl = document.createElement('p');
      errorEl.className = 'form-error-msg';
      errorEl.textContent = message;
      errorEl.setAttribute('role', 'alert');

      // Remove existing error msg for this field
      var existingError = field.parentElement.querySelector('.form-error-msg');
      if (existingError) existingError.remove();

      if (field.type === 'checkbox') {
        field.closest('.form-checkbox').appendChild(errorEl);
      } else {
        field.parentElement.appendChild(errorEl);
      }
    } else {
      field.classList.remove('error');
      var existingError = field.parentElement.querySelector('.form-error-msg');
      if (existingError) existingError.remove();
    }

    return isValid;
  }


  /* ---- Copyright year ---- */
  function initCopyright() {
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }


  /* ---- Active nav highlight ---- */
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute('href') === '#' + id;
              link.style.color = isActive ? 'var(--color-navy)' : '';
              link.style.fontWeight = isActive ? '600' : '';
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }


  /* ---- Initialize everything on DOM ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initForms();
    initCopyright();
    initActiveNav();
  });
})();
