/* Shubham Mallick — shared site behavior */
(function () {
  'use strict';

  /* Mobile navigation toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link')) nav.classList.remove('open');
    });
  }

  /* Scroll-reveal (skip when reduced motion is requested) */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Contact form (client-side only — no backend) */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (form && status) {
    function setStatus(msg, type) {
      status.textContent = msg;
      status.className = 'form-status ' + type;
      if (type === 'success' || type === 'error') {
        setTimeout(function () { status.className = 'form-status'; }, 6000);
      }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      if (!name || !email || !message) {
        setStatus('Please fill in every field before sending.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('That email address does not look valid.', 'error');
        return;
      }
      setStatus('Thanks, ' + name + ' — your message is ready to send. Connect via the email or LinkedIn links above.', 'success');
      form.reset();
    });
  }
})();
