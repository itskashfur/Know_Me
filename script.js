/* script.js
   - navigation toggle (mobile)
   - hero heading animation (pop Hi -> type name)
   - intersection observer for scroll animations
   - per-letter split + reveal for headings/other elements
   - typewriter-like reveal for small descriptions
   - contact form: open mailto on submit
*/

// ---------- helpers ----------
const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

// ---------- NAVIGATION ----------
const nav = qs('.nav');
const navToggle = qs('#navToggle');
const navListEl = qs('#navList');

// Responsive nav toggle for mobile
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}
if (navListEl) {
  navListEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Signature logo animation (Babylonica font, writes letter by letter)
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.signature-logo');
  if (logo) {
    const name = "Kashfur Rahman";
    logo.textContent = "";
    logo.style.opacity = "1";
    logo.style.transform = "translateY(-60px)";
    logo.style.transition = "opacity 0.6s cubic-bezier(.2,.9,.3,1), transform 0.7s cubic-bezier(.2,.9,.3,1)";
    setTimeout(() => {
      logo.style.transform = "translateY(0)";
    }, 180);

    let i = 0;
    function writeLetter() {
      if (i < name.length) {
        logo.textContent += name[i];
        i++;
        setTimeout(writeLetter, 120); // adjust speed as needed
      }
    }
    setTimeout(writeLetter, 400); // start after drop animation
  }
});


// Close nav when a link is clicked (mobile)
qsa('.nav a').forEach(a => {
  a.addEventListener('click', () => {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// ---------- YEAR ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- HERO ANIMATION ----------
function heroIntro() {
  const hi = document.querySelector('.hi-part');
  const namePart = document.querySelector('.name-part');
  if (!hi || !namePart) return;

  hi.style.opacity = 0;
  hi.classList.add('hi-pop');
  requestAnimationFrame(() => {
    hi.style.opacity = 1;
    hi.style.animation = 'popIn .45s ease-out forwards';
  });

  const fullName = 'I am Kashfur Rahman';
  setTimeout(() => {
    typeInto(namePart, fullName, 45, () => {
      const img = document.querySelector('.profile-image');
      if (img) img.classList.add('float');
      const desc = document.querySelector('.hero-desc');
      if (desc) desc.classList.add('fade-up');
      const socials = document.querySelector('.socials');
      if (socials) socials.classList.add('fade-up');
      const cta = document.querySelector('.hero-cta');
      if (cta) cta.classList.add('fade-up');
      const sub = document.querySelector('.hero-sub');
      if (sub) sub.classList.add('fade-up');
      const heading = document.querySelector('.hero-heading');
      if (heading) heading.classList.add('fade-up');
      const profile = document.querySelector('.profile-image');
      if (profile) profile.classList.add('fade-up');
    });
  }, 520);
}

// Typewriter function for hero
function typeInto(el, text, delay = 50, cb) {
  el.textContent = '';
  el.style.opacity = 1;
  let i = 0;
  const step = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(step, delay + (i % 3) * 6);
    } else {
      if (cb) cb();
    }
  };
  step();
}

// ---------- SPLIT LETTERS ----------
function splitLetters(el) {
  if (!el || el.dataset._split) return;
  const text = el.textContent.trim();
  el.textContent = '';
  const frag = document.createDocumentFragment();
  for (let ch of text) {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = ch;
    frag.appendChild(span);
  }
  el.appendChild(frag);
  el.dataset._split = 'true';
  return el;
}

function revealLettersIn(el, baseDelay = 30) {
  if (!el || !el.dataset._split) return;
  el.style.opacity = 1;
  el.style.transform = 'none';
  el.style.transition = 'none';
  const letters = el.querySelectorAll('.letter');
  letters.forEach((span, idx) => {
    setTimeout(() => span.classList.add('pop'), idx * baseDelay);
  });
}

// ---------- INTERSECTION OBSERVER ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!entry.target.classList.contains('inview'))
        entry.target.classList.add('animate');
      entry.target.classList.add('inview');

      if (entry.target.dataset.split != 'done') {
        const title = entry.target.querySelector('[data-split]');
        if (title) {
          const el = title;
          if (!el.dataset._split) {
            splitLetters(el);
          }
          revealLettersIn(el, 22);
          el.dataset.split = 'done';
        }
      }
      if (entry.target.classList.contains('project-row')) {
        const items = entry.target.querySelectorAll('.project-item');
        items.forEach((item, idx) => {
          setTimeout(() => item.classList.add('fade-up'), idx * 100);
        });
      }
      if (entry.target.classList.contains('masonry-item')) {
        entry.target.classList.add('fade-up');
      }
      const typed = entry.target.querySelectorAll('[data-typewriter]');
      typed.forEach(t => {
        if (!t.dataset.typed) {
          runTypewriterOnElement(t);
          t.dataset.typed = 'done';
        }
      });
      io.unobserve(entry.target);
    } else {
      entry.target.classList.remove('animate');
      entry.target.classList.remove('inview');
    }
  });
}, { threshold: 0.18 });

// ---------- DOM READY ----------
document.addEventListener('DOMContentLoaded', () => {
  heroIntro();
  qsa('[data-animate]').forEach(el => io.observe(el));
  qsa('[data-split]').forEach(h => {
    splitLetters(h);
    io.observe(h.parentElement || h);
  });
  qsa('.project-row').forEach(pr => io.observe(pr));
  qsa('.masonry-item').forEach(m => io.observe(m));
});

// ---------- TYPEWRITER FOR PARAGRAPHS ----------
function runTypewriterOnElement(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  let i = 0;
  const len = text.length;
  const speed = Math.max(6, Math.round(18 - Math.min(12, text.length / 10)));
  function tick() {
    el.textContent += text[i++];
    if (i < len) setTimeout(tick, speed + (i % 3));
  }
  tick();
}

// ---------- CONTACT FORM ----------
const contactForm = qs('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const message = formData.get('message') || '';
    const to = 'hello@yourdomain.com'; // <-- replace with your real recipient

    const subject = encodeURIComponent(`Website message from ${name || email}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    const note = qs('#formMessage');
    if (note) {
      note.textContent = 'Opening your mail client — please send the email to complete.';
      setTimeout(() => note.textContent = '', 6000);
    }
  });
}

// ---------- MAIL FALLBACK ----------
const mailFallback = qs('#mailFallback');
if (mailFallback) {
  mailFallback.addEventListener('click', () => {
    window.location.href = 'mailto:hello@yourdomain.com?subject=Contact';
  });
}

// ---------- PROFILE IMAGE PARALLAX ----------
const pimg = qs('.profile-image');
if (pimg) {
  pimg.addEventListener('mousemove', (ev) => {
    const rect = pimg.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width - 0.5;
    const y = (ev.clientY - rect.top) / rect.height - 0.5;
    pimg.style.transform = `translate3d(${x * 6}px,${y * -6}px,0) scale(1.01)`;
  });
  pimg.addEventListener('mouseleave', () => {
    pimg.style.transform = '';
  });
}

// ---------- CLOSE NAV ON LINK CLICK (FOR MOBILE) ----------
qsa('#navList a').forEach(a => {
  a.addEventListener('click', () => {
    if (navListEl && navListEl.classList.contains('open')) {
      navListEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});