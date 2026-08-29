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

  /* Contact form → delivers to your inbox.
     Default: opens the visitor's email (Gmail compose) pre-filled to you.
     Optional direct delivery: set FORM_ENDPOINT to a Formspree/Formspark URL
     and messages arrive in your inbox with no action needed from the visitor. */
  var FORM_ENDPOINT = 'https://formspree.io/f/xrenepnd'; // Formspree → delivers messages straight to your inbox
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
    function gmailCompose(name, email, message) {
      var to = 'shubham.mallick1440@gmail.com';
      var subj = 'Portfolio message from ' + name;
      var body = message + '\n\n— ' + name + '\nReply to: ' + email;
      return 'https://mail.google.com/mail/?view=cm&fs=1&to=' +
        encodeURIComponent(to) + '&su=' + encodeURIComponent(subj) +
        '&body=' + encodeURIComponent(body);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var message = document.getElementById('message').value.trim();
      if (!name || !email || !message) {
        setStatus('Please fill in every field before sending.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('That email address does not look valid.', 'error');
        return;
      }
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: name, email: email, message: message, _subject: 'Portfolio message from ' + name })
        }).then(function (r) {
          if (r.ok) {
            setStatus('Thanks, ' + name + ' — your message is on its way to my inbox.', 'success');
            form.reset();
          } else { throw new Error(); }
        }).catch(function () {
          setStatus('Sending failed. Please email me directly using the link above.', 'error');
        });
      } else {
        window.open(gmailCompose(name, email, message), '_blank');
        setStatus('Your email opened, pre-filled to me. Press Send to deliver your message.', 'success');
        form.reset();
      }
    });
  }

  /* Visitor counter (backend: countapi.xyz — serverless, no auth, no PII).
     Updates every element with class .vc; shows a placeholder on failure. */
  var vcEls = document.querySelectorAll('.vc');
  if (vcEls.length) {
    fetch('https://api.countapi.xyz/hit/shubham-mallick-portfolio/visits')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && typeof d.value === 'number') {
          vcEls.forEach(function (el) { el.textContent = d.value.toLocaleString(); });
        }
      })
      .catch(function () { /* keep placeholder on failure */ });
  }
})();
