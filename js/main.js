/* Vikendica Kalina — vanilla JS, no dependencies. */

/* ======= CONTACT — fill in when the owner sends the numbers (international format, digits only) =======
   phone:    for "Pozovi" buttons            e.g. '381641234567'
   whatsapp: number that receives WhatsApp   (usually the same)
   viber:    number that receives Viber      (usually the same)
   While these are empty the page still works as a demo: WhatsApp/Viber open with the message
   ready and let you pick the contact, and "Pozovi" shows a note instead of dialing. */
// phone: public number from the Google Maps listing. whatsapp/viber: same number, NOT yet confirmed with the owner (see TODO.md).
const CONTACT = { phone: '381616477375', whatsapp: '381616477375', viber: '381616477375' };

// (the 'js' class on <html> is set by a one-line inline script in <head>, before first paint)

const LANG = document.documentElement.lang.startsWith('en') ? 'en' : 'sr';
const T = {
  sr: {
    noPhone: 'Broj telefona još nije unet — ovo je demo verzija sajta.',
    copied: 'Poruka je kopirana. Nalepite je u Viber razgovor.',
    req: 'Ovo polje je obavezno.',
    fromPast: 'Datum dolaska ne može biti u prošlosti.',
    toBefore: 'Odlazak mora biti posle dolaska.',
    guests: 'Upišite broj gostiju (najmanje 1).',
    name: 'Upišite ime.',
    hello: 'Zdravo, zanima me Vikendica Kalina.',
    fromL: 'Dolazak', toL: 'Odlazak', guestsL: 'Broj gostiju', nameL: 'Ime',
    nights: (n) => `(${n} ${n % 10 === 1 && n % 100 !== 11 ? 'noć' : 'noći'})`,
    quick: 'Zdravo, zanima me Vikendica Kalina. Da li imate slobodan termin?',
    locale: 'sr-Latn-RS',
  },
  en: {
    noPhone: 'The phone number is not set yet — this is a demo version of the site.',
    copied: 'Message copied. Paste it into the Viber chat.',
    req: 'This field is required.',
    fromPast: 'Arrival can’t be in the past.',
    toBefore: 'Departure must be after arrival.',
    guests: 'Enter the number of guests (at least 1).',
    name: 'Enter your name.',
    hello: 'Hello, I’m interested in Vikendica Kalina.',
    fromL: 'Arrival', toL: 'Departure', guestsL: 'Guests', nameL: 'Name',
    nights: (n) => `(${n} ${n === 1 ? 'night' : 'nights'})`,
    quick: 'Hello, I’m interested in Vikendica Kalina. Do you have free dates?',
    locale: 'en-GB',
  },
}[LANG];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Toast ---------- */
const toastEl = $('.toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 4000);
}

/* ---------- Header: transparent over the hero photo, solid after ---------- */
const hdr = $('.hdr');
const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Tab bar: highlight the section on screen ---------- */
const tabs = $$('.tab[data-tab]');
if (tabs.length && 'IntersectionObserver' in window) {
  const byId = Object.fromEntries(tabs.map((t) => [t.dataset.tab, t]));
  const tio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const t = byId[en.target.id];
      if (!t) return;
      if (en.isIntersecting) {
        tabs.forEach((x) => { x.classList.remove('is-active'); x.removeAttribute('aria-current'); });
        t.classList.add('is-active');
        t.setAttribute('aria-current', 'location');
      } else if (t.classList.contains('is-active')) {
        t.classList.remove('is-active');
        t.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  Object.keys(byId).forEach((id) => { const el = document.getElementById(id); if (el) tio.observe(el); });
}

/* ---------- Contact links ---------- */
const digits = (s) => String(s || '').replace(/\D/g, '');
function waUrl(text) {
  const n = digits(CONTACT.whatsapp);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
$$('.js-call').forEach((a) => {
  if (digits(CONTACT.phone)) {
    a.href = `tel:+${digits(CONTACT.phone)}`;
  } else {
    a.addEventListener('click', (e) => { e.preventDefault(); toast(T.noPhone); });
  }
});
$$('.js-wa').forEach((a) => { a.href = waUrl(T.quick); });

/* ---------- Map: load Google Maps only on request ---------- */
$$('.map').forEach((box) => {
  $('.map__load', box)?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = box.dataset.src;
    f.title = box.dataset.title;
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    box.append(f);
    f.focus();
  });
});

/* ---------- Lightbox ---------- */
const lb = $('.lb');
const items = $$('.gal__btn');
if (lb && items.length) {
  const stage = $('.lb__stage', lb);
  const altEl = $('.lb__alt', lb);
  const countEl = $('.lb__count', lb);
  let idx = 0;
  let opener = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    const b = items[idx];
    stage.replaceChildren();
    if (b.dataset.full) {
      const img = new Image();
      img.src = b.dataset.full;
      img.alt = b.dataset.alt;
      if (b.dataset.w) { img.width = b.dataset.w; img.height = b.dataset.h; }
      stage.append(img);
    } else {
      const ph = document.createElement('span');
      ph.className = 'ph';
      ph.setAttribute('role', 'img');
      ph.setAttribute('aria-label', b.dataset.alt);
      ph.innerHTML = `<span class="ph__label"></span>`;
      ph.firstChild.textContent = b.dataset.label;
      stage.append(ph);
    }
    altEl.textContent = b.dataset.alt;
    countEl.textContent = `${idx + 1} / ${items.length}`;
  }

  items.forEach((b, i) => b.addEventListener('click', () => {
    opener = b;
    show(i);
    lb.showModal();
    document.body.style.overflow = 'hidden';
    $('.lb__close', lb).focus();
  }));
  $('.lb__prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb__next', lb).addEventListener('click', () => show(idx + 1));
  $('.lb__close', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => { document.body.style.overflow = ''; opener?.focus(); });
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = $$('button', lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // swipe
  let x0 = null, y0 = null;
  lb.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
  lb.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    x0 = y0 = null;
  });
}

/* ---------- Inquiry form → WhatsApp / Viber ---------- */
const form = $('#inquiry-form');
if (form) {
  const f = {
    from: $('#f-from'), to: $('#f-to'), guests: $('#f-guests'), name: $('#f-name'), msg: $('#f-msg'),
  };
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = iso(new Date());
  f.from.min = today;
  f.to.min = today;
  f.from.addEventListener('change', () => {
    if (f.from.value) f.to.min = f.from.value;
    if (f.to.dataset.touched) check('to');
  });

  const rules = {
    from: () => (!f.from.value ? T.req : f.from.value < today ? T.fromPast : ''),
    to: () => (!f.to.value ? T.req : f.from.value && f.to.value <= f.from.value ? T.toBefore : ''),
    guests: () => { const n = Number(f.guests.value); return !f.guests.value || !Number.isInteger(n) || n < 1 ? T.guests : ''; },
    name: () => (!f.name.value.trim() ? T.name : ''),
  };
  function check(key) {
    const msg = rules[key]();
    const input = f[key];
    $(`#e-${key}`).textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }
  Object.keys(rules).forEach((k) => {
    f[k].addEventListener('blur', () => { f[k].dataset.touched = '1'; check(k); });
    f[k].addEventListener('input', () => { if (f[k].getAttribute('aria-invalid')) check(k); });
  });

  const fmt = (v) => new Date(`${v}T12:00:00`).toLocaleDateString(T.locale, { day: 'numeric', month: 'numeric', year: 'numeric' });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((k) => !check(k));
    if (bad.length) { f[bad[0]].focus(); return; }
    const nights = Math.round((new Date(f.to.value) - new Date(f.from.value)) / 86400000);
    const text = [
      T.hello,
      '',
      `${T.fromL}: ${fmt(f.from.value)}`,
      `${T.toL}: ${fmt(f.to.value)} ${T.nights(nights)}`,
      `${T.guestsL}: ${f.guests.value}`,
      `${T.nameL}: ${f.name.value.trim()}`,
      f.msg.value.trim() ? `\n${f.msg.value.trim()}` : '',
    ].join('\n').trim();

    const via = e.submitter?.value || 'whatsapp';
    if (via === 'viber') {
      const n = digits(CONTACT.viber);
      if (n) {
        navigator.clipboard?.writeText(text).then(() => toast(T.copied)).catch(() => {});
        location.href = `viber://chat?number=%2B${n}`;
      } else {
        location.href = `viber://forward?text=${encodeURIComponent(text)}`;
      }
    } else {
      window.open(waUrl(text), '_blank', 'noopener');
    }
  });
}
